import { Queue } from "bullmq";
import { redis } from "../db/redis.js";
import { QUEUES, defaultJobOptions } from "./queues.js";
import type { CodeExecutionJob } from "./queues.js";
import { randomUUID } from "node:crypto";

export class ExecutionQueue {
  private queue: Queue<CodeExecutionJob>;

  constructor() {
    this.queue = new Queue<CodeExecutionJob>(QUEUES.CODE_EXECUTION, {
      connection: redis,
      defaultJobOptions,
    }) as Queue<CodeExecutionJob>;
  }

  async enqueue(job: CodeExecutionJob): Promise<string> {
    const streamToken = randomUUID();
    await this.queue.add("execute", job, { jobId: job.jobId });
    // Store stream token → jobId mapping in Redis (TTL 10 minutes)
    await redis.setex(`stream:${streamToken}`, 600, job.jobId);
    return streamToken;
  }
}
