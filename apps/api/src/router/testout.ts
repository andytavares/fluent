import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";
import { TestoutService } from "../service/testout.js";

export const testoutRouter = router({
  startChallenge: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        conceptId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new TestoutService(ctx.db);
      return service.startChallenge(input.enrollmentId, input.conceptId);
    }),

  submitChallenge: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        conceptId: z.string().uuid(),
        code: z.string().min(1),
        timerExpired: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;
      const service = new TestoutService(ctx.db);
      return service.submitChallenge({
        enrollmentId: input.enrollmentId,
        conceptId: input.conceptId,
        userId,
        code: input.code,
        timerExpired: input.timerExpired,
      });
    }),
});
