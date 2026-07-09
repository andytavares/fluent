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

  // Test-out submissions are scored server-side by the submission pipeline
  // (submissions.createSubmission with kind "test_out").
});
