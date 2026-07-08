import { Queue } from "bullmq";
import { streamTokenKey } from "@fluent/execution-contract";
import { redis } from "../db/redis.js";
import { CODE_EXECUTION_QUEUE, defaultJobOptions } from "./queues.js";
import type { CodeExecutionJob } from "./queues.js";
import { TokenBucketLimiter, RateLimitExceededError } from "./rate-limiter.js";
import { randomUUID } from "node:crypto";

// Every execution job enters through here, so the per-learner rate limit is
// enforced at this seam (FR-012) — not in the sandbox, which only dequeues.
export class ExecutionQueue {
  private queue: Queue<CodeExecutionJob>;
  private limiter: TokenBucketLimiter;

  constructor() {
    this.queue = new Queue<CodeExecutionJob>(CODE_EXECUTION_QUEUE, {
      connection: redis,
      defaultJobOptions,
    }) as Queue<CodeExecutionJob>;
    this.limiter = new TokenBucketLimiter(redis);
  }

  /** @throws RateLimitExceededError when the learner is over their execution budget */
  async enqueue(job: CodeExecutionJob): Promise<string> {
    const rate = await this.limiter.consume(job.userId);
    if (!rate.allowed) {
      throw new RateLimitExceededError(rate.retryAfterSeconds);
    }

    const streamToken = randomUUID();
    await this.queue.add("execute", job, { jobId: job.jobId });
    // Store stream token → jobId mapping in Redis (TTL 10 minutes)
    await redis.setex(streamTokenKey(streamToken), 600, job.jobId);
    return streamToken;
  }
}
