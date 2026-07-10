import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./trpc.js";
import { startCapstoneWorkflow, signalLearnerActive, signalVerifyStep } from "../temporal/capstone-client.js";
import { CapstonePrereqService } from "../service/capstone-prereq.js";
import { createContentStore } from "@fluent/content-config";
import { estimateComplexity } from "@fluent/complexity-heuristic";
import type { PrismaClient } from "@prisma/client";

const CAPSTONE_RUNNER_URL = process.env["CAPSTONE_RUNNER_URL"] ?? "http://localhost:3004";
const content = createContentStore();

// Every capstone track has exactly one project (`<language>-crud-api`),
// matching each entry's `capstoneSlug` in capstone-runner's LANGUAGE_RUNTIMES
// table (apps/capstone-runner/src/language-runtimes.ts). Content for most of
// these (task #29) doesn't exist on disk yet — getSteps below gracefully
// returns [] for a slug with no content directory rather than throwing.
const CAPSTONE_SLUG_BY_TRACK: Record<string, string> = {
  go: "go-crud-api",
  python: "python-crud-api",
  javascript: "javascript-crud-api",
  typescript: "typescript-crud-api",
  ruby: "ruby-crud-api",
  java: "java-crud-api",
  kotlin: "kotlin-crud-api",
  rust: "rust-crud-api",
  c: "c-crud-api",
  cpp: "cpp-crud-api",
  elixir: "elixir-crud-api",
};

/** Loads the session and throws FORBIDDEN if it doesn't belong to this user (same pattern as submissions.getSubmission). */
async function ownedSession(db: PrismaClient, sessionId: string, userId: string) {
  const session = await db.capstoneSessions.findUniqueOrThrow({ where: { id: sessionId } });
  if (session.userId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return session;
}

/**
 * ownedSession + rejects completed sessions. Every mutation that touches the
 * session's live environment (verify, deploy, query) must use this: a
 * completed session's workflow is gone (Temporal silently drops signals to
 * it) and its pod is torn down (deploy/query fetches fail opaquely) — fail
 * loud with one consistent message instead. getSessionStatus deliberately
 * keeps plain ownedSession so the UI can still read expired sessions.
 */
async function activeOwnedSession(db: PrismaClient, sessionId: string, userId: string) {
  const session = await ownedSession(db, sessionId, userId);
  if (session.completedAt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "This capstone session has expired — start a new session to continue.",
    });
  }
  return session;
}

/** Resolves the track slug (language) an enrollment belongs to. */
async function enrollmentTrackSlug(db: PrismaClient, enrollmentId: string): Promise<string> {
  const enrollment = await db.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: { track: true },
  });
  return enrollment.track.slug;
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
        const trackSlug = await enrollmentTrackSlug(ctx.db, input.enrollmentId);
        await startCapstoneWorkflow(session.id, trackSlug);
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
      await activeOwnedSession(ctx.db, input.sessionId, ctx.user.id!);

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
      const session = await activeOwnedSession(ctx.db, input.sessionId, ctx.user.id!);
      const trackSlug = await enrollmentTrackSlug(ctx.db, session.enrollmentId);

      const res = await fetch(`${CAPSTONE_RUNNER_URL}/sessions/${input.sessionId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.code, language: trackSlug }),
      });
      const body = (await res.json()) as { compileLog?: string; error?: string };
      if (!res.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: body.error ?? "Deploy failed" });
      }
      // Rough static-analysis estimate — not persisted, computed fresh from
      // the deployed code each time.
      const complexity = estimateComplexity(input.code, trackSlug);
      return { ...body, complexity } as { compileLog: string; complexity: typeof complexity };
    }),

  runQuery: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), sql: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await activeOwnedSession(ctx.db, input.sessionId, ctx.user.id!);

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
