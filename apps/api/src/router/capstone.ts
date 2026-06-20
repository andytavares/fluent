import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";
import { startCapstoneWorkflow, signalLearnerActive } from "../temporal/capstone-client.js";
import { CapstonePrereqService } from "../service/capstone-prereq.js";

export const capstoneRouter = router({
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

      await startCapstoneWorkflow(session.id);
      return session;
    }),

  getSessionStatus: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.capstoneSessions.findUniqueOrThrow({
        where: { id: input.sessionId },
        include: { stepCompletions: { orderBy: { stepNumber: "asc" } } },
      });
      await signalLearnerActive(session.id);
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
      // Temporal verifier activity handles the actual verification
      // This endpoint triggers and returns the result
      await signalLearnerActive(input.sessionId);
      return { sessionId: input.sessionId, stepNumber: input.stepNumber, status: "pending" };
    }),
});
