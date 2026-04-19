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

// Types

type RenderPayload = {
  projectId: string;
  jobId: string;
  roomId: string;
  retryCount?: number;
};

// Constants 

const QUEUE_NAME = "EditorRender";
const MAX_RETRIES = 3;
const LOOP_ERROR_BACKOFF_MS = 2000;
const ffmpegBin = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";

// Redis

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
});

// Logging

function log(msg: string) {
  console.log(`[editor-worker] ${new Date().toISOString()} ${msg}`);
}

// Payload Parsing 

function parsePayload(raw: string): RenderPayload | null {
  try {
    const p = JSON.parse(raw);
    if (!p.projectId || !p.jobId || !p.roomId) return null;
    return { ...p, retryCount: p.retryCount ?? 0 };
  } catch {
    return null;
  }
}

// Progress

async function updateProgress(jobId: string, percent: number) {
  await prisma.exportJob.update({
    where: { id: jobId },
    data: {
      progress: percent
    },
  });
}

// Source Verification

// Descriptive error with full path context
async function verifySourceExists(sourcePath: string) {
  try {
    const stat = await fs.stat(sourcePath);
    if (!stat.isFile()) {
      throw new Error(`Path exists but is not a file: ${sourcePath}`);
    }
  } catch (err: any) {
    throw new Error(`Source file not accessible at "${sourcePath}": ${err.message}`);
  }
}

// Overlay Filter
function buildOverlayFilter(overlays: any[], timelineOffsetMs = 0): string | null {
  if (!overlays?.length) return null;

  const filters = overlays
    .map((o) => {
      const content = o.content as Record<string, any>;
      const text = (content?.text ?? "")
        .replace(/:/g, "\\:")
        .replace(/'/g, "\\'")
        .replace(/,/g, "\\,");

      if (!text) return null;

      const transform = o.transform as Record<string, any>;
      const x = transform?.x ?? 100;
      const y = transform?.y ?? 100;

      // Adjust timestamps relative to this clip's start
      const adjustedStart = Math.max(0, o.timelineStartMs - timelineOffsetMs);
      const adjustedEnd = Math.max(0, o.timelineStartMs + o.durationMs - timelineOffsetMs);

      const start = (adjustedStart / 1000).toFixed(2);
      const end = (adjustedEnd / 1000).toFixed(2);

      return `drawtext=text='${text}':x=${x}:y=${y}:fontsize=24:fontcolor=white:enable='between(t,${start},${end})'`;
    })
    .filter(Boolean);

  return filters.length ? filters.join(",") : null;
}

// FFmpeg Builders

function buildTrimArgs(
  input: string,
  output: string,
  startSec: string,
  durationSec: string,
  overlayFilter?: string | null
): string[] {
  return [
    "-y",
    "-ss", startSec,
    "-i", input,
    "-t", durationSec,
    ...(overlayFilter ? ["-vf", overlayFilter] : []),
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-c:a", "aac",
    "-b:a", "192k",
    output,
  ];
}

async function buildConcatArgs(
  parts: string[],
  output: string
): Promise<{ args: string[]; listPath: string }> {
  const listPath = output.replace(".mp4", "_concat.txt");
  await fs.writeFile(listPath, parts.map((p) => `file '${p}'`).join("\n"), "utf8");

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

// Preview scoped to the actual export region, not the whole source file
async function renderPreview(
  input: string,
  output: string,
  startSec: string,
  durationSec: string
) {
  await runBinary(ffmpegBin, [
    "-y",
    "-ss", startSec,
    "-i", input,
    "-t", durationSec,
    "-vf", "scale=640:-2",
    "-preset", "ultrafast",
    "-crf", "32",
    "-c:a", "aac",
    "-b:a", "96k",
    output,
  ]);
}

// Core Render

async function processRenderJob(payload: RenderPayload) {
  const project = await prisma.editorProject.findFirst({
    where: { id: payload.projectId },
    include: {
      tracks: { include: { clips: true }, orderBy: { order: "asc" } },
      overlays: true,
      meeting: { include: { finalRecording: true } },
      assets: true,
    },
  });

  if (!project) throw new Error(`Project not found: ${payload.projectId}`);

  // Prefer persisted asset URL, fall back to finalRecording
  const assetUrl = project.assets[0]?.url ?? project.meeting.finalRecording?.videoLink;
  if (!assetUrl) throw new Error("No source video configured for project");

  // All clips across all tracks, sorted by timeline position
  const clips = project.tracks
    .flatMap((t) => t.clips)
    .sort((a, b) => a.timelineStartMs - b.timelineStartMs);

  if (!clips.length) throw new Error("No clips found for export");

  const inputPath = toLocalRecordingPath(assetUrl);
  await verifySourceExists(inputPath);

  const exportDir = path.join(
    recordingsRoot,
    payload.roomId,
    "editor",
    "projects",
    payload.projectId,
    "exports"
  );
  await ensureDir(exportDir);

  const outputPath = path.join(exportDir, `${payload.jobId}.mp4`);
  const previewPath = outputPath.replace(".mp4", "_preview.mp4");

  // Preview only the export region
  const firstClip = clips[0]!;
  const totalDurationMs = clips.reduce((sum, c) => sum + c.durationMs, 0);

  await renderPreview(
    inputPath,
    previewPath,
    (firstClip.sourceStartMs / 1000).toFixed(3),
    (totalDurationMs / 1000).toFixed(3)
  );
  await updateProgress(payload.jobId, 10);

  const tempFiles: string[] = [];
  let concatListPath: string | null = null;

  if (clips.length === 1) {
    const c = clips[0]!;

    // Overlay timestamps offset by clip's timeline start
    const overlayFilter = buildOverlayFilter(project.overlays, c.timelineStartMs);

    await runBinary(
      ffmpegBin,
      buildTrimArgs(
        inputPath,
        outputPath,
        (c.sourceStartMs / 1000).toFixed(3),
        (c.durationMs / 1000).toFixed(3),
        overlayFilter
      )
    );

    await updateProgress(payload.jobId, 80);
  } else {
    // Sequential — never run ffmpeg processes in parallel (CPU corruption risk)
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i]!;
      const partPath = path.join(exportDir, `${payload.jobId}_part${i}.mp4`);

      // Per-clip overlay offset so timestamps align within the trimmed segment
      const overlayFilter = buildOverlayFilter(project.overlays, c.timelineStartMs);

      await runBinary(
        ffmpegBin,
        buildTrimArgs(
          inputPath,
          partPath,
          (c.sourceStartMs / 1000).toFixed(3),
          (c.durationMs / 1000).toFixed(3),
          overlayFilter
        )
      );

      tempFiles.push(partPath);

      const percent = 10 + Math.round(((i + 1) / clips.length) * 70);
      await updateProgress(payload.jobId, percent);
    }

    const { args, listPath } = await buildConcatArgs(tempFiles, outputPath);
    concatListPath = listPath;

    await runBinary(ffmpegBin, args);
    await updateProgress(payload.jobId, 90);
  }

  // Cleanup temp part files and concat list
  await Promise.allSettled(tempFiles.map((f) => fs.unlink(f)));
  if (concatListPath) await fs.unlink(concatListPath).catch(() => {});

  // Store path relative to recordingsRoot — serve as public URL at request time
  const relativeOutputPath = path.relative(recordingsRoot, outputPath);

  await prisma.exportJob.update({
    where: { id: payload.jobId },
    data: {
      status: "DONE",
      outputUrl: relativeOutputPath,
      error: null, // not overwritten by progress — progress lives in Redis
    },
  });

  await prisma.editorProject.update({
    where: { id: payload.projectId },
    data: { status: "COMPLETED" },
  });

  // No updateProgress(100) here — job is already finalized above
  log(`Done: ${payload.jobId}`);
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

async function main() {
  log(`Listening on ${QUEUE_NAME}`);

  while (true) {
    // Outer try/catch — Redis or DB blip won't crash the entire worker
    try {
      const result = await connection.blpop(QUEUE_NAME, 0);
      if (!result) continue;

      const payload = parsePayload(result[1]);
      if (!payload) {
        log("Skipped invalid payload");
        continue;
      }

      // Verify the job still exists and is in QUEUED state
      const job = await prisma.exportJob.findUnique({ where: { id: payload.jobId } });
      if (!job) {
        log(`Job ${payload.jobId} not found in DB, skipping`);
        continue;
      }
      if (job.status !== "QUEUED") {
        log(`Skipping job ${payload.jobId} — status is "${job.status}"`);
        continue;
      }

      // Optimistic lock: filter by status: "QUEUED" so two workers
      //    racing on the same job can't both transition to PROCESSING
      try {
        await prisma.exportJob.update({
          where: { id: payload.jobId, status: "QUEUED" },
          data: { status: "PROCESSING", error: null },
        });
      } catch {
        log(`Job ${payload.jobId} claimed by another worker, skipping`);
        continue;
      }

      try {
        await processRenderJob(payload);
      } catch (err: any) {
        const retry = payload.retryCount ?? 0;
        console.error(`[editor-worker] Job ${payload.jobId} failed (attempt ${retry + 1}):`, err);

        if (retry < MAX_RETRIES) {
          log(`Re-queuing job ${payload.jobId} for retry ${retry + 1}/${MAX_RETRIES}`);

          await prisma.exportJob.update({
            where: { id: payload.jobId },
            data: {
              status: "QUEUED",
              error: `Attempt ${retry + 1} failed: ${err.message}`,
            },
          });

          await connection.lpush(
            QUEUE_NAME,
            JSON.stringify({ ...payload, retryCount: retry + 1 })
          );
        } else {
          log(`Job ${payload.jobId} permanently failed after ${MAX_RETRIES} retries`);

          await prisma.exportJob.update({
            where: { id: payload.jobId },
            data: {
              status: "FAILED",
              error: err.message ?? "Unknown failure",
            },
          });

          await prisma.editorProject.update({
            where: { id: payload.projectId },
            data: { status: "FAILED" },
          });
        }
      }
    } catch (loopErr) {
      // Log and back off — never let a transient error kill the worker process
      console.error("[editor-worker] Queue loop error:", loopErr);
      await new Promise((r) => setTimeout(r, LOOP_ERROR_BACKOFF_MS));
    }
  }
}

main().catch((e) => {
  console.error("[editor-worker] Fatal startup error:", e);
  process.exit(1);
});