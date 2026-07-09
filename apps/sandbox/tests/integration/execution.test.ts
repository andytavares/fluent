import { describe, it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { Queue } from "bullmq";
import { CODE_EXECUTION_QUEUE, resultStreamKey } from "@fluent/execution-contract";
import type { CodeExecutionJob } from "@fluent/execution-contract";

// Real lifecycle test through the shipping seam: BullMQ enqueue → execution
// worker → result stream in Redis. Requires a reachable Redis; skips
// (visibly) when there isn't one.

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

async function probeRedis(): Promise<boolean> {
  const probe = new Redis(REDIS_URL, {
    lazyConnect: true,
    connectTimeout: 500,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  try {
    await probe.connect();
    await probe.ping();
    return true;
  } catch {
    return false;
  } finally {
    probe.disconnect();
  }
}

const redisUp = await probeRedis();

describe.skipIf(!redisUp)("Execution job lifecycle integration", () => {
  const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  const queue = new Queue<CodeExecutionJob>(CODE_EXECUTION_QUEUE, { connection });

  afterAll(async () => {
    await queue.close();
    connection.disconnect();
  });

  it("enqueue → worker executes → result entry lands in the Redis stream", async () => {
    const { createExecutionWorker } = await import("../../src/worker/execution-worker.js");
    const worker = createExecutionWorker();

    const jobId = randomUUID();
    await queue.add("execute", {
      jobId,
      userId: randomUUID(),
      code: "console.log('lifecycle ok')",
      language: "javascript",
      isSuite: false,
    });

    try {
      const deadline = Date.now() + 20_000;
      let resultEntry: Record<string, string> | null = null;
      let stdout = "";

      while (Date.now() < deadline && !resultEntry) {
        const entries = await connection.xrange(resultStreamKey(jobId), "-", "+");
        for (const [, fields] of entries) {
          const obj: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) obj[fields[i]!] = fields[i + 1]!;
          if (obj["type"] === "stdout") stdout += obj["data"] ?? "";
          if (obj["type"] === "result") resultEntry = obj;
        }
        if (!resultEntry) await new Promise((r) => setTimeout(r, 200));
      }

      expect(resultEntry, "worker never wrote a result entry").not.toBeNull();
      expect(resultEntry!["exit_code"]).toBe("0");
      expect(stdout).toContain("lifecycle ok");
    } finally {
      await worker.close();
    }
  }, 30_000);
});
