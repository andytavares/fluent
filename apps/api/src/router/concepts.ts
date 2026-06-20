import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";

export const conceptsRouter = router({
  listConceptStates: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.conceptState.findMany({
        where: {
          enrollmentId: input.enrollmentId,
          concept: { status: "published" }, // exclude wip concepts (FR-038)
        },
        include: {
          concept: { select: { slug: true, title: true, position: true, hasTestout: true } },
        },
        orderBy: { concept: { position: "asc" } },
      });
    }),
});
