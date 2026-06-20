import { Worker } from "bullmq";
import { redis } from "../db/redis.js";
import { runGoCode } from "../executor/docker-runner.js";
import { logger } from "../middleware/logger.js";
import { executionsTotal, executionDuration } from "../middleware/metrics.js";
import { CODE_EXECUTION_QUEUE, WORKER_CONCURRENCY } from "./queues.js";

interface CodeExecutionJob {
  jobId: string;
  userId: string;
  conceptId: string;
  exerciseId?: string;
  code: string;
  language: string;
  isSuite: boolean;
  testFiles?: string[];
}

export function createExecutionWorker() {
  return new Worker<CodeExecutionJob>(
    CODE_EXECUTION_QUEUE,
    async (job) => {
      const { jobId, userId, conceptId, code, testFiles } = job.data;
      const start = Date.now();

      logger.info({
        event: "execution_start",
        jobId,
        userId,
        conceptId,
      });

      try {
        const result = await runGoCode(code, testFiles);
        const durationMs = Date.now() - start;

        // Write stdout/stderr before result so SSE consumer gets them before stream closes
        if (result.stdout) {
          await redis.xadd(`result:${jobId}`, "*", "type", "stdout", "data", result.stdout);
        }
        if (result.stderr) {
          await redis.xadd(`result:${jobId}`, "*", "type", "stderr", "data", result.stderr);
        }

        // Write result last — SSE streamer closes stream on this entry
        await redis.xadd(
          `result:${jobId}`,
          "*",
          "type",
          "result",
          "exit_code",
          String(result.exitCode ?? -1),
          "runtime_ms",
          String(result.runtimeMs ?? 0),
          "timed_out",
          String(result.timedOut),
        );

        // Set TTL so streams don't accumulate
        await redis.expire(`result:${jobId}`, 300);

        // Structured log per FR-049
        logger.info({
          event: "execution_complete",
          jobId,
          userId,
          conceptId,
          duration_ms: durationMs,
          exit_code: result.exitCode,
          timed_out: result.timedOut,
        });

        executionDuration.observe(durationMs / 1000);
        executionsTotal.inc({ status: result.exitCode === 0 ? "success" : "failure" });

        return { jobId, exitCode: result.exitCode, runtimeMs: result.runtimeMs };
      } catch (err) {
        const durationMs = Date.now() - start;
        logger.error({ event: "execution_error", jobId, userId, conceptId, duration_ms: durationMs, err });
        executionsTotal.inc({ status: "error" });
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: WORKER_CONCURRENCY,
    },
  );
}
