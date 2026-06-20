import type { Redis } from "ioredis";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_TOKENS = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class TokenBucketLimiter {
  constructor(private redis: Redis) {}

  async consume(userId: string): Promise<RateLimitResult> {
    const key = `rate:execution:${userId}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - RATE_LIMIT_WINDOW_SECONDS;

    // Use a sorted set: score = timestamp, member = unique request id
    const pipe = this.redis.pipeline();
    // Remove expired entries
    pipe.zremrangebyscore(key, 0, windowStart);
    // Count current tokens used
    pipe.zcard(key);
    const results = await pipe.exec();

    const count = (results?.[1]?.[1] as number) ?? 0;
    const remaining = RATE_LIMIT_MAX_TOKENS - count;

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      };
    }

    // Add this request
    const requestId = `${now}-${Math.random()}`;
    await this.redis.zadd(key, now, requestId);
    await this.redis.expire(key, RATE_LIMIT_WINDOW_SECONDS + 1);

    return {
      allowed: true,
      remaining: remaining - 1,
      retryAfterSeconds: 0,
    };
  }
}
