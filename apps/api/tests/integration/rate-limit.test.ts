import { describe, it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { TokenBucketLimiter } from "../../src/queue/rate-limiter.js";

// Exercises the Lua token bucket against a real Redis (the script is the
// implementation — mocking Redis would test nothing). Skips visibly when
// Redis is unreachable.

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

describe.skipIf(!redisUp)("TokenBucketLimiter", () => {
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

  afterAll(() => {
    redis.disconnect();
  });

  it("allows up to 10 executions per window, then rejects with a retry hint", async () => {
    const userId = randomUUID();
    const limiter = new TokenBucketLimiter(redis);

    for (let i = 0; i < 10; i++) {
      const result = await limiter.consume(userId);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(10 - i - 1);
    }

    const eleventh = await limiter.consume(userId);
    expect(eleventh.allowed).toBe(false);
    expect(eleventh.retryAfterSeconds).toBe(60);

    await redis.del(`rate:execution:${userId}`);
  });

  it("tracks budgets per learner independently", async () => {
    const userA = randomUUID();
    const userB = randomUUID();
    const limiter = new TokenBucketLimiter(redis);

    for (let i = 0; i < 10; i++) await limiter.consume(userA);
    expect((await limiter.consume(userA)).allowed).toBe(false);
    expect((await limiter.consume(userB)).allowed).toBe(true);

    await redis.del(`rate:execution:${userA}`, `rate:execution:${userB}`);
  });
});
