import { z } from "zod";
import { router, protectedProcedure } from "./trpc.js";
import { PlacementService } from "../service/placement.js";
import { createContentStore } from "@fluent/content-config";

const content = createContentStore();

export const placementRouter = router({
  startPlacement: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const service = new PlacementService(ctx.db);
      const concepts = await service.startPlacement(input.enrollmentId);

      const enrollment = await ctx.db.enrollment.findUniqueOrThrow({
        where: { id: input.enrollmentId },
        include: { track: true },
      });

      return Promise.all(
        concepts.map(async (concept) => {
          const exercise = await ctx.db.exercise.findFirst({
            where: { conceptId: concept.id, type: "lesson" },
          });
          let stub = "";
          let taskPrompt = "";
          if (exercise?.contentPath) {
            stub = content.getLessonStub(exercise.contentPath, enrollment.track.language);
            taskPrompt = content.getTaskPrompt(exercise.contentPath);
          }
          return { ...concept, stub, taskPrompt, language: enrollment.track.language };
        }),
      );
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
