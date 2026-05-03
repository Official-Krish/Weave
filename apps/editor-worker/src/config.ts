import ffmpegStatic from "ffmpeg-static";

export const CONFIG = {
  QUEUE_NAME: "EditorRender",
  TRANSCODE_QUEUE_NAME: "TranscodeVideo",
  MAX_RETRIES: 3,
  LOOP_ERROR_BACKOFF_MS: 2_000,
  CONCURRENCY: Math.max(1, Number(process.env.WORKER_CONCURRENCY ?? 1)),
  BLPOP_TIMEOUT_S: 5, // non-infinite so shutdown signal is checked regularly
  FFMPEG_BIN: process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg",
} as const;
