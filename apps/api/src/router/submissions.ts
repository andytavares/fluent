import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { z } from "zod";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./trpc.js";
import { ExecutionQueue } from "../queue/execution-queue.js";
import { MasteryService } from "../service/mastery.js";
import { StreakService } from "../service/streak.js";

export const submissionsRouter = router({
  createSubmission: protectedProcedure
    .input(
      z.object({
        conceptId: z.string().uuid(),
        exerciseId: z.string().uuid().optional(),
        code: z.string().min(1),
        language: z.string().default("go"),
        isSuite: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const submission = await ctx.db.submission.create({
        data: {
          userId,
          conceptId: input.conceptId,
          exerciseId: input.exerciseId ?? null,
          code: input.code,
          language: input.language,
          isSuite: input.isSuite,
        },
      });

      // When running tests, read the test file from the content directory
      let testFiles: string[] = [];
      if (input.isSuite) {
        const exercise = await ctx.db.exercise.findFirst({
          where: { conceptId: input.conceptId, type: "lesson" },
        });
        if (exercise?.contentPath) {
          const dir = join(REPO_ROOT, exercise.contentPath);
          try {
            const files = readdirSync(dir);
            const testFile = files.find((f) => f.endsWith("_test.go"));
            if (testFile) {
              testFiles = [readFileSync(join(dir, testFile), "utf8")];
            }
          } catch {
            // content directory missing — run without tests
          }
        }
      }

      const queue = new ExecutionQueue();
      const streamToken = await queue.enqueue({
        jobId: submission.id,
        userId,
        conceptId: input.conceptId,
        exerciseId: input.exerciseId,
        code: input.code,
        language: input.language,
        isSuite: input.isSuite,
        testFiles,
      });

      return { submissionId: submission.id, streamToken };
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
    .input(
      z.object({
        submissionId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
        stdout: z.string().optional(),
        stderr: z.string().optional(),
        exitCode: z.number().int(),
        runtimeMs: z.number().int(),
        timedOut: z.boolean(),
        passed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const submission = await ctx.db.submission.update({
        where: { id: input.submissionId },
        data: {
          stdout: input.stdout ?? null,
          stderr: input.stderr ?? null,
          exitCode: input.exitCode,
          runtimeMs: input.runtimeMs,
          timedOut: input.timedOut,
          passed: input.passed ?? null,
        },
      });

      // Update streak on any submission
      const streakService = new StreakService(ctx.db);
      await streakService.updateStreak(userId);

      // If suite passed → advance concept state
      if (submission.isSuite && input.passed) {
        const masteryService = new MasteryService(ctx.db);
        await masteryService.createMasteryEvent({
          enrollmentId: input.enrollmentId,
          conceptId: submission.conceptId,
          userId,
          achievedVia: "lesson",
        });
      }

      return submission;
    }),
});
