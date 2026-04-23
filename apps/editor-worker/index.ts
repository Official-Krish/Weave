import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Redis } from "ioredis";
import ffmpegStatic from "ffmpeg-static";
import { prisma } from "@repo/db/client";
import {
  ensureDir,
  recordingsRoot,
  runBinary,
  toLocalRecordingPath,
} from "./src/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

type RenderPayload = {
  projectId: string;
  jobId: string;
  roomId: string;
  retryCount?: number;
};

type LogLevel = "info" | "warn" | "error" | "debug";

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  QUEUE_NAME: "EditorRender",
  TRANSCODE_QUEUE_NAME: "TranscodeVideo",
  MAX_RETRIES: 3,
  LOOP_ERROR_BACKOFF_MS: 2_000,
  CONCURRENCY: Math.max(1, Number(process.env.WORKER_CONCURRENCY ?? 1)),
  BLPOP_TIMEOUT_S: 5, // non-infinite so shutdown signal is checked regularly
  FFMPEG_BIN: process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg",
} as const;

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    worker: "editor-worker",
    msg,
    ...meta,
  };
  const line = JSON.stringify(entry);
  level === "error" ? console.error(line) : console.log(line);
}

// ─── Metrics (lightweight in-process counters) ────────────────────────────────

const metrics = {
  processed: 0,
  failed: 0,
  retried: 0,
  activeSlots: 0,
};

function logMetrics() {
  log("info", "metrics", { ...metrics });
}

// ─── Redis ────────────────────────────────────────────────────────────────────

function createRedis(name: string) {
  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    retryStrategy: (times) => Math.min(times * 100, 3_000),
    maxRetriesPerRequest: null, // required for BullMQ / blocking commands
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on("error", (err) => log("error", `Redis[${name}] error`, { err: err.message }));
  client.on("reconnecting", () => log("warn", `Redis[${name}] reconnecting`));
  client.on("ready", () => log("info", `Redis[${name}] ready`));
  return client;
}

const connection = createRedis("main");

// ─── Graceful shutdown ────────────────────────────────────────────────────────

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("info", `Received ${signal} — draining active jobs then exiting`);

  // Wait until all slots are free (max 60 s)
  const deadline = Date.now() + 60_000;
  while (metrics.activeSlots > 0 && Date.now() < deadline) {
    await sleep(500);
  }

  logMetrics();
  await connection.quit().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function parsePayload(raw: string): RenderPayload | null {
  try {
    const p = JSON.parse(raw);
    if (typeof p.projectId !== "string" || typeof p.jobId !== "string" || typeof p.roomId !== "string") {
      log("warn", "Invalid payload shape", { raw: raw.slice(0, 200) });
      return null;
    }
    return { ...p, retryCount: p.retryCount ?? 0 };
  } catch (err: any) {
    log("warn", "Failed to parse payload", { err: err.message, raw: raw.slice(0, 200) });
    return null;
  }
}

async function updateProgress(jobId: string, percent: number) {
  await prisma.exportJob.update({
    where: { id: jobId },
    data: { progress: percent },
  });
}

async function verifySourceExists(sourcePath: string) {
  try {
    const stat = await fs.stat(sourcePath);
    if (!stat.isFile()) throw new Error(`Path exists but is not a file: ${sourcePath}`);
  } catch (err: any) {
    throw new Error(`Source file not accessible at "${sourcePath}": ${err.message}`);
  }
}

function sanitizeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,");
}

function buildOverlayFilter(overlays: any[], timelineOffsetMs = 0): string | null {
  if (!overlays?.length) return null;

  const filters = overlays
    .map((o) => {
      const text = sanitizeDrawtext(o.content?.text ?? "");
      if (!text) return null;

      const x = Number.isFinite(o.transform?.x) ? o.transform.x : 100;
      const y = Number.isFinite(o.transform?.y) ? o.transform.y : 100;
      const start = ((o.timelineStartMs - timelineOffsetMs) / 1000).toFixed(2);
      const end = ((o.timelineStartMs + o.durationMs - timelineOffsetMs) / 1000).toFixed(2);

      return `drawtext=text='${text}':x=${x}:y=${y}:fontsize=24:fontcolor=white:enable='between(t,${start},${end})'`;
    })
    .filter(Boolean);

  return filters.length ? filters.join(",") : null;
}

async function buildConcatArgs(parts: string[], output: string) {
  const listPath = output.replace(/\.mp4$/, "_concat.txt");
  const content = parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.writeFile(listPath, content, "utf8");

  return {
    args: [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "22",
      "-c:a", "aac",
      "-b:a", "192k",
      output,
    ],
    listPath,
  };
}

function getCanonicalFinalDir(roomId: string) {
  return path.join(recordingsRoot, roomId, "final");
}

function getCanonicalFinalPath(roomId: string) {
  return path.join(getCanonicalFinalDir(roomId), "meeting_grid_recording.mp4");
}

function getCanonicalHlsDir(roomId: string) {
  return path.join(recordingsRoot, roomId, "hls");
}

async function removeIfExists(targetPath: string) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function promoteRenderedVideo(roomId: string, renderedPath: string) {
  const finalDir = getCanonicalFinalDir(roomId);
  const finalPath = getCanonicalFinalPath(roomId);

  await ensureDir(finalDir);
  await removeIfExists(finalPath);
  await fs.rename(renderedPath, finalPath);

  return finalPath;
}

async function refreshMeetingRecordingArtifacts(roomId: string, finalPath: string, jobId: string, projectId: string) {
  const publicFinalPath = path.relative(recordingsRoot, finalPath);
  const normalizedPublicFinalPath = publicFinalPath.startsWith("..")
    ? finalPath
    : `/api/v1/recordings/${publicFinalPath.split(path.sep).join("/")}`;

  await removeIfExists(getCanonicalHlsDir(roomId));

  const hostMeeting = await prisma.meeting.findFirst({
    where: {
      roomId,
      isHost: true,
    },
    include: {
      finalRecording: true,
    },
  });

  if (!hostMeeting) {
    throw new Error(`Host meeting not found for room ${roomId}`);
  }

  await prisma.$transaction([
    prisma.exportJob.update({
      where: { id: jobId },
      data: {
        status: "DONE",
        outputUrl: normalizedPublicFinalPath,
        progress: 100,
        error: null,
      },
    }),
    prisma.editorProject.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    }),
    prisma.finalRecording.upsert({
      where: {
        meetingId: hostMeeting.id,
      },
      create: {
        meetingId: hostMeeting.id,
        videoLink: normalizedPublicFinalPath,
        visibleToEmails: hostMeeting.finalRecording?.visibleToEmails ?? [],
      },
      update: {
        videoLink: normalizedPublicFinalPath,
      },
    }),
    prisma.meeting.updateMany({
      where: {
        roomId,
      },
      data: {
        recordingState: "PROCESSING",
        processingStartedAt: new Date(),
        processingEndedAt: null,
      },
    }),
  ]);

  await connection.rpush(
    CONFIG.TRANSCODE_QUEUE_NAME,
    JSON.stringify({
      meetingId: roomId,
      finalPath,
    }),
  );

  return normalizedPublicFinalPath;
}

// ─── Core render logic ────────────────────────────────────────────────────────

async function processRenderJob(payload: RenderPayload): Promise<void> {
  const { projectId, jobId, roomId } = payload;

  log("info", "Job started", { jobId, projectId });

  const project = await prisma.editorProject.findFirst({
    where: { id: projectId },
    include: {
      tracks: { include: { clips: true }, orderBy: { order: "asc" } },
      overlays: true,
      meeting: { include: { finalRecording: true } },
      assets: true,
    },
  });

  if (!project) throw new Error(`Project not found: ${projectId}`);

  const fps = project.fps ?? 30;
  const width = project.width ?? 1280;
  const height = project.height ?? 720;

  const assetUrl = project.assets[0]?.url ?? project.meeting?.finalRecording?.videoLink;
  if (!assetUrl) throw new Error("No source video asset found");

  const clips = project.tracks
    .flatMap((t) => t.clips)
    .sort((a, b) => a.timelineStartMs - b.timelineStartMs);

  if (!clips.length) throw new Error("No clips found in project");

  const inputPath = toLocalRecordingPath(assetUrl);
  await verifySourceExists(inputPath);

  const exportDir = path.join(recordingsRoot, roomId, "editor", "projects", projectId, "exports");
  await ensureDir(exportDir);

  const outputPath = path.join(exportDir, `${jobId}.mp4`);
  const previewPath = outputPath.replace(/\.mp4$/, "_preview.mp4");

  const firstClip = clips[0]!;
  const totalDurationMs = clips.reduce((sum, c) => sum + c.durationMs, 0);

  // ── Preview (low-res, ultrafast) ──────────────────────────────────────────
  log("debug", "Generating preview", { jobId });
  await runBinary(CONFIG.FFMPEG_BIN, [
    "-y",
    "-ss", (firstClip.sourceStartMs / 1000).toFixed(3),
    "-i", inputPath,
    "-t", (totalDurationMs / 1000).toFixed(3),
    "-vf", "scale=640:-2",
    "-preset", "ultrafast",
    "-crf", "32",
    "-c:a", "aac",
    previewPath,
  ]);

  await updateProgress(jobId, 10);

  const buildVF = (overlay: string | null) =>
    overlay ? `${overlay},scale=${width}:${height}` : `scale=${width}:${height}`;

  const tempFiles: string[] = [];
  let concatListPath: string | null = null;

  try {
    if (clips.length === 1) {
      const c = clips[0]!;
      const overlay = buildOverlayFilter(project.overlays, c.timelineStartMs);

      await runBinary(CONFIG.FFMPEG_BIN, [
        "-y",
        "-ss", (c.sourceStartMs / 1000).toFixed(3),
        "-i", inputPath,
        "-t", (c.durationMs / 1000).toFixed(3),
        "-vf", buildVF(overlay),
        "-r", String(fps),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        outputPath,
      ]);

      await updateProgress(jobId, 80);
    } else {
      // ── Multi-clip: encode parts then concat ────────────────────────────
      for (let i = 0; i < clips.length; i++) {
        const c = clips[i]!;
        const partPath = path.join(exportDir, `${jobId}_part${i}.mp4`);
        const overlay = buildOverlayFilter(project.overlays, c.timelineStartMs);

        log("debug", `Encoding part ${i + 1}/${clips.length}`, { jobId });
        await runBinary(CONFIG.FFMPEG_BIN, [
          "-y",
          "-ss", (c.sourceStartMs / 1000).toFixed(3),
          "-i", inputPath,
          "-t", (c.durationMs / 1000).toFixed(3),
          "-vf", buildVF(overlay),
          "-r", String(fps),
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "22",
          "-c:a", "aac",
          "-b:a", "192k",
          partPath,
        ]);

        tempFiles.push(partPath);
        await updateProgress(jobId, 10 + Math.round(((i + 1) / clips.length) * 70));
      }

      const { args, listPath } = await buildConcatArgs(tempFiles, outputPath);
      concatListPath = listPath;

      log("debug", "Concatenating parts", { jobId, parts: tempFiles.length });
      await runBinary(CONFIG.FFMPEG_BIN, args);
      await updateProgress(jobId, 90);
    }

    // ── Promote to canonical final recording and trigger retranscode ──────
    const finalPath = await promoteRenderedVideo(roomId, outputPath);
    const publicFinalPath = await refreshMeetingRecordingArtifacts(roomId, finalPath, jobId, projectId);

    log("info", "Job completed and promoted to final recording", {
      jobId,
      finalPath,
      publicFinalPath,
      transcodeQueue: CONFIG.TRANSCODE_QUEUE_NAME,
    });
    metrics.processed++;
  } finally {
    // Always clean up temp files, even on failure
    await Promise.allSettled([
      fs.unlink(previewPath),
      ...tempFiles.map((f) => fs.unlink(f)),
      concatListPath ? fs.unlink(concatListPath) : Promise.resolve(),
    ]);
  }
}

// ─── Job runner with retry logic ──────────────────────────────────────────────

async function handleJob(payload: RenderPayload): Promise<void> {
  const { jobId, projectId } = payload;

  // Atomic QUEUED → PROCESSING transition (guards against duplicate processing)
  try {
    await prisma.exportJob.update({
      where: { id: jobId, status: "QUEUED" },
      data: { status: "PROCESSING", error: null },
    });
  } catch {
    log("warn", "Job already processing or not QUEUED — skipping", { jobId });
    return;
  }

  try {
    await processRenderJob(payload);
  } catch (err: any) {
    const retry = payload.retryCount ?? 0;
    log("error", "Job failed", { jobId, retry, err: err.message });

    if (retry < CONFIG.MAX_RETRIES) {
      metrics.retried++;
      await prisma.exportJob.update({
        where: { id: jobId },
        data: { status: "QUEUED", error: err.message },
      });
      await connection.rpush(
        CONFIG.QUEUE_NAME,
        JSON.stringify({ ...payload, retryCount: retry + 1 }),
      );
      log("info", "Job re-queued", { jobId, attempt: retry + 1 });
    } else {
      metrics.failed++;
      await prisma.$transaction([
        prisma.exportJob.update({
          where: { id: jobId },
          data: { status: "FAILED", error: err.message },
        }),
        prisma.editorProject.update({
          where: { id: projectId },
          data: { status: "FAILED" },
        }),
      ]);
      log("error", "Job permanently failed", { jobId, projectId });
    }
  }
}

// ─── Worker loop ──────────────────────────────────────────────────────────────

async function workerLoop(id: number): Promise<void> {
  log("info", `Worker ${id} started`, { concurrency: CONFIG.CONCURRENCY });

  while (!shuttingDown) {
    let result: [string, string] | null = null;

    try {
      result = await connection.blpop(CONFIG.QUEUE_NAME, CONFIG.BLPOP_TIMEOUT_S);
    } catch (err: any) {
      log("error", `Worker ${id} blpop error`, { err: err.message });
      await sleep(CONFIG.LOOP_ERROR_BACKOFF_MS);
      continue;
    }

    if (!result) continue; // timeout — loop again so we check shuttingDown

    const payload = parsePayload(result[1]);
    if (!payload) continue;

    const job = await prisma.exportJob
      .findUnique({ where: { id: payload.jobId } })
      .catch((err) => {
        log("error", "DB lookup failed", { jobId: payload.jobId, err: err.message });
        return null;
      });

    if (!job || job.status !== "QUEUED") {
      log("debug", "Skipping non-QUEUED job", { jobId: payload.jobId, status: job?.status });
      continue;
    }

    metrics.activeSlots++;
    try {
      await handleJob(payload);
    } finally {
      metrics.activeSlots--;
    }
  }

  log("info", `Worker ${id} exiting`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  log("info", "Editor worker starting", {
    concurrency: CONFIG.CONCURRENCY,
    queue: CONFIG.QUEUE_NAME,
    ffmpeg: CONFIG.FFMPEG_BIN,
  });

  // Emit metrics every 60 s
  const metricsInterval = setInterval(logMetrics, 60_000);
  metricsInterval.unref();

  // Launch N concurrent worker loops
  const workers = Array.from({ length: CONFIG.CONCURRENCY }, (_, i) => workerLoop(i + 1));
  await Promise.all(workers);
}

main().catch((err) => {
  log("error", "Fatal startup error", { err: err.message, stack: err.stack });
  process.exit(1);
});
