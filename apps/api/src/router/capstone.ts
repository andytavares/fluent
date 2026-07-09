import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./trpc.js";
import { startCapstoneWorkflow, signalLearnerActive, signalVerifyStep } from "../temporal/capstone-client.js";
import { CapstonePrereqService } from "../service/capstone-prereq.js";
import { createContentStore } from "@fluent/content-config";
import type { PrismaClient } from "@prisma/client";

const CAPSTONE_RUNNER_URL = process.env["CAPSTONE_RUNNER_URL"] ?? "http://localhost:3004";
const content = createContentStore();

// Every capstone track has exactly one project for v1 (go-crud-api); this
// mirrors ADR-005's per-language track slug pattern closely enough that a
// second track's capstone can follow the same convention when it exists.
const CAPSTONE_SLUG_BY_TRACK: Record<string, string> = { go: "go-crud-api" };

/** Loads the session and throws FORBIDDEN if it doesn't belong to this user (same pattern as submissions.getSubmission). */
async function ownedSession(db: PrismaClient, sessionId: string, userId: string) {
  const session = await db.capstoneSessions.findUniqueOrThrow({ where: { id: sessionId } });
  if (session.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return session;
}

export const capstoneRouter = router({
  getSteps: protectedProcedure
    .input(z.object({ trackSlug: z.string() }))
    .query(({ input }) => {
      const capstoneSlug = CAPSTONE_SLUG_BY_TRACK[input.trackSlug];
      if (!capstoneSlug) return [];
      return content.getCapstoneSteps(capstoneSlug);
    }),

  getCapstone: protectedProcedure
    .input(z.object({ trackSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.track.findUniqueOrThrow({
        where: { slug: input.trackSlug },
      });
      const userId = ctx.user.id!;
      const enrollment = await ctx.db.enrollment.findUniqueOrThrow({
        where: { userId_trackId: { userId, trackId: track.id } },
      });
      const session = await ctx.db.capstoneSessions.findFirst({
        where: { enrollmentId: enrollment.id, completedAt: null },
        include: { stepCompletions: { orderBy: { stepNumber: "asc" } } },
      });
      return { track, enrollment, session };
    }),

  createSession: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      // Prerequisite check (T135): all concepts must be mastered/completed
      const prereqService = new CapstonePrereqService(ctx.db);
      await prereqService.assertAllConceptsMastered(input.enrollmentId);

      // Resume existing active session if present
      const existing = await ctx.db.capstoneSessions.findFirst({
        where: { enrollmentId: input.enrollmentId, completedAt: null },
        include: { stepCompletions: { orderBy: { stepNumber: "asc" } } },
      });
      if (existing) return existing;

      const session = await ctx.db.capstoneSessions.create({
        data: { userId, enrollmentId: input.enrollmentId },
      });

      try {
        await startCapstoneWorkflow(session.id);
      } catch {
        await ctx.db.capstoneSessions.delete({ where: { id: session.id } });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not start your capstone environment — this usually means backend services aren't running. Try again in a moment.",
        });
      }
      return session;
    }),

  getSessionStatus: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.capstoneSessions.findUniqueOrThrow({
        where: { id: input.sessionId },
        include: { stepCompletions: { orderBy: { stepNumber: "asc" } } },
      });
      if (session.userId !== ctx.user.id!) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return session;
    }),

  verifyStep: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        stepNumber: z.number().int().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ownedSession(ctx.db, input.sessionId, ctx.user.id!);

      // Signal learner activity and trigger step verification in Temporal workflow.
      // The workflow runs the verify activity and, on pass, records the step completion.
      // Poll getSessionStatus to see when stepCompletions updates.
      await signalLearnerActive(input.sessionId);
      await signalVerifyStep(input.sessionId, input.stepNumber);
      return { sessionId: input.sessionId, stepNumber: input.stepNumber, status: "pending" };
    }),

  deployCode: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ownedSession(ctx.db, input.sessionId, ctx.user.id!);

      const res = await fetch(`${CAPSTONE_RUNNER_URL}/sessions/${input.sessionId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.code }),
      });
      const body = (await res.json()) as { compileLog?: string; error?: string };
      if (!res.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: body.error ?? "Deploy failed" });
      }
      return body as { compileLog: string };
    }),

  runQuery: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), sql: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ownedSession(ctx.db, input.sessionId, ctx.user.id!);

      const res = await fetch(`${CAPSTONE_RUNNER_URL}/sessions/${input.sessionId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: input.sql }),
      });
      const body = (await res.json()) as
        | { kind: "rows"; columns: string[]; rows: string[][] }
        | { kind: "message"; message: string }
        | { error: string };
      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error" in body ? body.error : "Query failed",
        });
      }
      return body as { kind: "rows"; columns: string[]; rows: string[][] } | { kind: "message"; message: string };
    }),
});
