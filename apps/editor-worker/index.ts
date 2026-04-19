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

type RenderPayload = {
  projectId: string;
  jobId: string;
  roomId: string;
  retryCount?: number;
};

const QUEUE_NAME = "EditorRender";
const MAX_RETRIES = 3;
const ffmpegBin = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
});

function log(msg: string) {
  console.log(`[editor-worker] ${new Date().toISOString()} ${msg}`);
}

function parsePayload(raw: string): RenderPayload | null {
  try {
    const p = JSON.parse(raw);
    if (!p.projectId || !p.jobId || !p.roomId) return null;
    return { ...p, retryCount: p.retryCount ?? 0 };
  } catch {
    return null;
  }
}

async function verifySourceExists(sourcePath: string) {
  const stat = await fs.stat(sourcePath);
  if (!stat.isFile()) throw new Error("Source is not a file");
}

function buildTrimArgs(
  input: string,
  output: string,
  start: string,
  duration: string
) {
  return [
    "-y",
    "-ss", start,
    "-i", input,
    "-t", duration,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-c:a", "aac",
    "-b:a", "192k",
    output,
  ];
}

async function buildConcatArgs(paths: string[], output: string) {
  const listPath = output.replace(".mp4", "_concat.txt");
  const content = paths.map((p) => `file '${p}'`).join("\n");
  await fs.writeFile(listPath, content);

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

  if (!project) throw new Error("Project not found");

  const asset = project.assets[0];
  const assetUrl = asset?.url ?? project.meeting.finalRecording?.videoLink;
  if (!assetUrl) throw new Error("No source video");

  const clips = project.tracks
    .flatMap((t) => t.clips)
    .sort((a, b) => a.timelineStartMs - b.timelineStartMs);

  if (!clips.length) throw new Error("No clips");

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

  let outputPath = path.join(exportDir, `${payload.jobId}.mp4`);
  let tempFiles: string[] = [];
  let concatFile: string | null = null;

  // SINGLE CLIP
  if (clips.length === 1) {
    const c = clips[0];
    if(!c) throw new Error("Clip not found");

    if (c.durationMs <= 0) throw new Error("Invalid duration");

    await runBinary(
      ffmpegBin,
      buildTrimArgs(
        inputPath,
        outputPath,
        (c.sourceStartMs / 1000).toFixed(3),
        (c.durationMs / 1000).toFixed(3)
      )
    );
  }

  // MULTI CLIP
  else {
    const trimmedPaths = await Promise.all(
      clips.map(async (c, i) => {
        if (c.durationMs <= 0) throw new Error("Invalid duration");

        const out = path.join(exportDir, `${payload.jobId}_part${i}.mp4`);

        await runBinary(
          ffmpegBin,
          buildTrimArgs(
            inputPath,
            out,
            (c.sourceStartMs / 1000).toFixed(3),
            (c.durationMs / 1000).toFixed(3)
          )
        );

        return out;
      })
    );

    tempFiles = trimmedPaths;

    const { args, listPath } = await buildConcatArgs(trimmedPaths, outputPath);
    concatFile = listPath;

    await runBinary(ffmpegBin, args);
  }

  // cleanup temp files
  await Promise.allSettled(tempFiles.map((f) => fs.unlink(f)));
  if (concatFile) await fs.unlink(concatFile).catch(() => {});

  const relativePath = path.relative(recordingsRoot, outputPath);

  await prisma.exportJob.update({
    where: { id: payload.jobId },
    data: {
      status: "DONE",
      outputUrl: relativePath,
      error: null,
    },
  });

  await prisma.editorProject.update({
    where: { id: payload.projectId },
    data: { status: "COMPLETED" },
  });

  log(`Done ${payload.jobId}`);
}

async function main() {
  log(`Listening on ${QUEUE_NAME}`);

  while (true) {
    const result = await connection.blpop(QUEUE_NAME, 0);
    if (!result) continue;

    const payload = parsePayload(result[1]);
    if (!payload) continue;

    const job = await prisma.exportJob.findUnique({
      where: { id: payload.jobId },
    });

    if (!job || job.status !== "QUEUED") continue;

    try {
      await prisma.exportJob.update({
        where: { id: payload.jobId, status: "QUEUED" },
        data: { status: "PROCESSING", error: null },
      });
    } catch {
      continue;
    }

    try {
      await processRenderJob(payload);
    } catch (err: any) {
      const retry = payload.retryCount ?? 0;

      if (retry < MAX_RETRIES) {
        await prisma.exportJob.update({
          where: { id: payload.jobId },
          data: {
            status: "QUEUED",
            error: err.message,
          },
        });

        await connection.lpush(
          QUEUE_NAME,
          JSON.stringify({ ...payload, retryCount: retry + 1 })
        );
      } else {
        await prisma.exportJob.update({
          where: { id: payload.jobId },
          data: {
            status: "FAILED",
            error: err.message,
          },
        });

        await prisma.editorProject.update({
          where: { id: payload.projectId },
          data: { status: "FAILED" },
        });
      }

      console.error(err);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});