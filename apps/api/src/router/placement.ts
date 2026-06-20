import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";
import { PlacementService } from "../service/placement.js";

export const placementRouter = router({
  startPlacement: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      return service.startPlacement(input.enrollmentId);
    }),

  submitTask: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        conceptId: z.string().uuid(),
        passed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      return service.scoreTask(input.enrollmentId, input.conceptId, input.passed);
    }),

  skipPlacement: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      return service.skipPlacement(input.enrollmentId);
    }),
});
