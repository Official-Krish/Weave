import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { Redis } from "ioredis";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import {
  HLS_PROFILES,
  buildMasterPlaylistContent,
  buildPosterArgs,
  buildRenditionArgs,
  buildSpriteArgs,
  buildThumbnailVtt,
  getTranscodeOutputDir,
} from "./utils";

type TranscodePayload = {
  meetingId: string;
  finalPath?: string;
};

const QUEUE_NAME = "TranscodeVideo";
const recordingsRoot = path.resolve(process.cwd(), "../../recordings");
const ffmpegBin = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";
const ffprobeBin = process.env.FFPROBE_PATH || ffprobeStatic.path || "ffprobe";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
});

function log(message: string) {
  console.log(`[transcoder] ${new Date().toISOString()} ${message}`);
}

function runBinary(binary: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const processRef = spawn(binary, args);
    let stderr = "";

    processRef.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${binary} exited with code ${code}: ${stderr}`));
    });

    processRef.on("error", (error) => {
      reject(error);
    });
  });
}

function readDurationSeconds(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const processRef = spawn(ffprobeBin, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    let stdout = "";
    let stderr = "";

    processRef.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    processRef.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}: ${stderr}`));
        return;
      }

      const parsed = Number.parseFloat(stdout.trim());
      if (!Number.isFinite(parsed) || parsed <= 0) {
        reject(new Error(`Invalid video duration from ffprobe output: ${stdout}`));
        return;
      }

      resolve(parsed);
    });

    processRef.on("error", (error) => {
      reject(error);
    });
  });
}

function getInputPath(payload: TranscodePayload) {
  if (payload.finalPath && payload.finalPath.trim()) {
    return payload.finalPath;
  }

  return path.join(recordingsRoot, payload.meetingId, "final", "meeting_grid_recording.mp4");
}

async function processMeeting(payload: TranscodePayload) {
  const inputPath = getInputPath(payload);
  const outputDir = getTranscodeOutputDir(recordingsRoot, payload.meetingId);

  await fs.access(inputPath);
  await fs.mkdir(outputDir, { recursive: true });

  log(`Transcoding started for ${payload.meetingId}`);
  const duration = await readDurationSeconds(inputPath);

  for (const profile of HLS_PROFILES) {
    await runBinary(ffmpegBin, buildRenditionArgs(inputPath, outputDir, profile));
  }

  await fs.writeFile(path.join(outputDir, "master.m3u8"), buildMasterPlaylistContent(), "utf8");

  await runBinary(ffmpegBin, buildPosterArgs(inputPath, outputDir));
  await runBinary(ffmpegBin, buildSpriteArgs(inputPath, outputDir, duration));

  const vtt = buildThumbnailVtt(duration);
  await fs.writeFile(path.join(outputDir, "thumbnails.vtt"), vtt, "utf8");

  log(`Transcoding completed for ${payload.meetingId}`);
}

function parsePayload(raw: string): TranscodePayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<TranscodePayload>;
    if (!parsed.meetingId || typeof parsed.meetingId !== "string") {
      return null;
    }

    return {
      meetingId: parsed.meetingId.trim(),
      finalPath: typeof parsed.finalPath === "string" ? parsed.finalPath : undefined,
    };
  } catch {
    return null;
  }
}

async function reportWorkerStatus(
  meetingId: string,
  status: "PROCESSING" | "READY" | "FAILED",
  finalPath?: string
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000/api/v1";
  const workerToken = process.env.WORKER_CALLBACK_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (workerToken) {
    headers["x-worker-token"] = workerToken;
  }

  const response = await fetch(`${backendUrl}/worker/recording-status/${meetingId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ status, finalPath }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Worker status callback failed (${response.status}): ${body}`);
  }
}

async function workQueue() {
  log(`Worker listening on queue ${QUEUE_NAME}`);

  while (true) {
    try {
      const result = await redisClient.blpop(QUEUE_NAME, 0);
      if (!result) {
        continue;
      }

      const payload = parsePayload(result[1]);
      if (!payload || !payload.meetingId) {
        log("Skipped invalid transcode payload");
        continue;
      }

      try {
        await reportWorkerStatus(payload.meetingId, "PROCESSING");
        await processMeeting(payload);
        const callbackFinalPath = payload.finalPath || getInputPath(payload);
        await reportWorkerStatus(payload.meetingId, "READY", callbackFinalPath);
      } catch (error) {
        console.error(`[transcoder] Failed for ${payload.meetingId}:`, error);
        try {
          await reportWorkerStatus(payload.meetingId, "FAILED");
        } catch (statusError) {
          console.error(`[transcoder] Failed to report FAILED for ${payload.meetingId}:`, statusError);
        }
      }
    } catch (error) {
      console.error("[transcoder] Queue loop error:", error);
    }
  }
}

workQueue();
