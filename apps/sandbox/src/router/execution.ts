import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "./trpc.js";
import { TokenBucketLimiter } from "../limiter/token-bucket.js";
import { redis } from "../db/redis.js";

const limiter = new TokenBucketLimiter(redis);

export const executionRouter = router({
  execute: authedProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        code: z.string().min(1),
        language: z.string().default("go"),
        isSuite: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rateResult = await limiter.consume(ctx.userId);

      if (!rateResult.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Retry after ${rateResult.retryAfterSeconds}s`,
          cause: { retry_after_seconds: rateResult.retryAfterSeconds },
        });
      }

      // Job is already enqueued by apps/api — sandbox just tracks it
      const streamUrl = `/stream/${input.jobId}`;
      return { jobId: input.jobId, streamUrl };
    }),
});
