import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./trpc.js";
import { ExecutionQueue } from "../queue/execution-queue.js";
import { RateLimitExceededError } from "../queue/rate-limiter.js";
import { redis } from "../db/redis.js";
import {
  SubmissionPipeline,
  SubmissionAccessError,
  ResultNotReadyError,
} from "../service/submission-pipeline.js";
import { createContentStore } from "@fluent/content-config";
import type { PrismaClient } from "@prisma/client";

const content = createContentStore();
const queue = new ExecutionQueue();

function pipeline(db: PrismaClient): SubmissionPipeline {
  return new SubmissionPipeline({
    db,
    redis,
    enqueue: (job) => queue.enqueue(job),
    content,
  });
}

async function withRateLimitMapped<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof RateLimitExceededError) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: err.message });
    }
    throw err;
  }
}

export const submissionsRouter = router({
  runSandbox: protectedProcedure
    .input(z.object({
      code: z.string().min(1),
      language: z.string().default("javascript"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { randomUUID } = await import("node:crypto");
      const jobId = randomUUID();
      const streamToken = await withRateLimitMapped(() =>
        queue.enqueue({
          jobId,
          userId: ctx.user.id!,
          code: input.code,
          language: input.language,
          isSuite: false,
        }),
      );
      return { streamToken };
    }),

  createSubmission: protectedProcedure
    .input(
      z.object({
        conceptId: z.string().uuid(),
        enrollmentId: z.string().uuid().optional(),
        exerciseId: z.string().uuid().optional(),
        code: z.string().min(1),
        language: z.string().default("go"), // caller must pass the correct language
        isSuite: z.boolean().default(false),
        kind: z.enum(["lesson", "test_out", "placement"]).default("lesson"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return withRateLimitMapped(() =>
        pipeline(ctx.db).begin({
          userId: ctx.user.id!,
          conceptId: input.conceptId,
          ...(input.enrollmentId ? { enrollmentId: input.enrollmentId } : {}),
          ...(input.exerciseId ? { exerciseId: input.exerciseId } : {}),
          code: input.code,
          language: input.language,
          isSuite: input.isSuite,
          kind: input.kind,
        }),
      );
    }),

  getSubmission: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.db.submission.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (submission.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return submission;
    }),

  completeSubmission: protectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pipeline(ctx.db).finalize({
          submissionId: input.submissionId,
          userId: ctx.user.id!,
        });
      } catch (err) {
        if (err instanceof SubmissionAccessError) {
          throw new TRPCError({ code: "FORBIDDEN", message: err.message });
        }
        if (err instanceof ResultNotReadyError) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
        }
        throw err;
      }
    }),
});
