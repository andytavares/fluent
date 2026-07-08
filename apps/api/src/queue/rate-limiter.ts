import type { Redis } from "ioredis";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_TOKENS = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class RateLimitExceededError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds}s`);
  }
}

// Atomically: remove expired entries, count current, conditionally add new entry.
// Returns [count_before_add, was_added] where was_added is 1 if allowed, 0 if rejected.
const CONSUME_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local max_tokens = tonumber(ARGV[3])
local request_id = ARGV[4]
local ttl = tonumber(ARGV[5])

redis.call('zremrangebyscore', key, 0, window_start)
local count = redis.call('zcard', key)

if count >= max_tokens then
  return {count, 0}
end

redis.call('zadd', key, now, request_id)
redis.call('expire', key, ttl)
return {count, 1}
`;

export class TokenBucketLimiter {
  constructor(private redis: Redis) {}

  async consume(userId: string): Promise<RateLimitResult> {
    const key = `rate:execution:${userId}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - RATE_LIMIT_WINDOW_SECONDS;
    const requestId = `${now}-${Math.random()}`;

    const result = await this.redis.eval(
      CONSUME_SCRIPT,
      1,
      key,
      String(now),
      String(windowStart),
      String(RATE_LIMIT_MAX_TOKENS),
      requestId,
      String(RATE_LIMIT_WINDOW_SECONDS + 1),
    ) as [number, number];

    const count = result[0];
    const allowed = result[1] === 1;

    if (!allowed) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
      };
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_TOKENS - count - 1,
      retryAfterSeconds: 0,
    };
  }
}
