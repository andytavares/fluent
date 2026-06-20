import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";

export const conceptsRouter = router({
  listConceptStates: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const enrollment = await ctx.db.enrollment.findUniqueOrThrow({
        where: { id: input.enrollmentId },
        select: { trackId: true },
      });

      // All published concepts for this track
      const allConcepts = await ctx.db.concept.findMany({
        where: { trackId: enrollment.trackId, status: "published" },
        orderBy: { position: "asc" },
      });

      // Existing states
      const existing = await ctx.db.conceptState.findMany({
        where: { enrollmentId: input.enrollmentId },
        select: { conceptId: true },
      });
      const existingIds = new Set(existing.map((s: { conceptId: string }) => s.conceptId));

      // Backfill any concepts added after enrollment
      const missing = allConcepts.filter((c: { id: string }) => !existingIds.has(c.id));
      if (missing.length > 0) {
        await ctx.db.conceptState.createMany({
          data: missing.map((c: { id: string }) => ({
            enrollmentId: input.enrollmentId,
            conceptId: c.id,
            state: "locked" as const,
          })),
          skipDuplicates: true,
        });
      }

      return ctx.db.conceptState.findMany({
        where: {
          enrollmentId: input.enrollmentId,
          concept: { status: "published" },
        },
        include: {
          concept: { select: { slug: true, title: true, position: true, hasTestout: true } },
        },
        orderBy: { concept: { position: "asc" } },
      });
    }),
});
