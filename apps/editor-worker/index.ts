import { CONFIG } from "./src/config";
import { log } from "./src/logger";
import { metrics, shutdown } from "./src/redis";
import { workerLoop } from "./src/worker";

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

async function main() {
  log("info", "Editor worker starting", {
    concurrency: CONFIG.CONCURRENCY,
    queue: CONFIG.QUEUE_NAME,
    ffmpeg: CONFIG.FFMPEG_BIN,
  });

  // Emit metrics every 60 s
  const metricsInterval = setInterval(() => log("info", "metrics", { ...metrics }), 60_000);
  metricsInterval.unref();

  // Launch N concurrent worker loops
  const workers = Array.from({ length: CONFIG.CONCURRENCY }, (_, i) => workerLoop(i + 1));
  await Promise.all(workers);
}

main().catch((err) => {
  log("error", "Fatal startup error", { err: err.message, stack: err.stack });
  process.exit(1);
});
