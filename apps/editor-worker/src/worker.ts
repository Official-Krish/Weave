import { prisma } from "@repo/db/client";
import { CONFIG } from "./config";
import { log } from "./logger";
import { connection, createRedis, isShuttingDown, metrics } from "./redis";
import { sleep, parsePayload } from "./utils";
import { handleJob } from "./jobs";

export async function workerLoop(id: number): Promise<void> {
  // Each worker gets its own blpop connection to avoid head-of-line stalling
  const workerConnection = createRedis(`worker-${id}`);
  log("info", `Worker ${id} started`, { concurrency: CONFIG.CONCURRENCY });

  try {
    while (!isShuttingDown()) {
      let result: [string, string] | null = null;

      try {
        result = await workerConnection.blpop(CONFIG.QUEUE_NAME, CONFIG.BLPOP_TIMEOUT_S);
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
  } finally {
    await workerConnection.quit().catch(() => {});
  }

  log("info", `Worker ${id} exiting`);
}
