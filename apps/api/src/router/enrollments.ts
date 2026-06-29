import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./trpc.js";

export const enrollmentsRouter = router({
  createEnrollment: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const existing = await ctx.db.enrollment.findUnique({
        where: { userId_trackId: { userId, trackId: input.trackId } },
      });
      if (existing) return existing;

      const enrollment = await ctx.db.enrollment.create({
        data: { userId, trackId: input.trackId },
      });

      const concepts = await ctx.db.concept.findMany({
        where: { trackId: input.trackId, status: "published" },
        orderBy: { position: "asc" },
      });

      await ctx.db.conceptState.createMany({
        data: concepts.map((concept: { id: string }, idx: number) => ({
          enrollmentId: enrollment.id,
          conceptId: concept.id,
          state: idx === 0 ? ("available" as const) : ("locked" as const),
        })),
      });

      return enrollment;
    }),

  resetEnrollment: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const existing = await ctx.db.enrollment.findUnique({
        where: { userId_trackId: { userId, trackId: input.trackId } },
      });
      if (!existing) return null;

      // Wipe all progress data for this enrollment
      const trackConcepts = await ctx.db.concept.findMany({
        where: { trackId: input.trackId },
        select: { id: true },
      });
      const conceptIds = trackConcepts.map((c: { id: string }) => c.id);

      await ctx.db.capstoneStepCompletion.deleteMany({
        where: { session: { enrollmentId: existing.id } },
      });
      await ctx.db.capstoneSessions.deleteMany({ where: { enrollmentId: existing.id } });
      await ctx.db.conceptState.deleteMany({ where: { enrollmentId: existing.id } });
      await ctx.db.masteryEvent.deleteMany({ where: { enrollmentId: existing.id } });
      await ctx.db.submission.deleteMany({ where: { userId, conceptId: { in: conceptIds } } });
      await ctx.db.enrollment.delete({ where: { id: existing.id } });

      return { reset: true };
    }),

  getEnrollment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.enrollment.findUniqueOrThrow({
        where: { id: input.id },
        include: { track: true },
      });
    }),

  listEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;
    return ctx.db.enrollment.findMany({
      where: { userId },
      include: { track: true },
      orderBy: { startedAt: "desc" },
    });
  }),

  devMasterAll: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (process.env["NODE_ENV"] === "production") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const userId = ctx.user.id!;
      const enrollment = await ctx.db.enrollment.findUnique({
        where: { userId_trackId: { userId, trackId: input.trackId } },
      });
      if (!enrollment) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.conceptState.updateMany({
        where: {
          enrollmentId: enrollment.id,
          state: { notIn: ["mastered", "completed"] },
        },
        data: { state: "mastered", achievedVia: "placement", masteredAt: new Date() },
      });

      return { ok: true };
    }),
});
