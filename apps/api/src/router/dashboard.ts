import { router, protectedProcedure } from "./trpc.js";
import { LearnerProgressService } from "../service/learner-progress.js";

export const dashboardRouter = router({
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const progressService = new LearnerProgressService(ctx.db);
    const rows = await progressService.forUser(ctx.user.id!);

    return rows.map(({ enrollment, progress }) => ({
      enrollment,
      track: enrollment.track,
      stats: {
        conceptsDone: progress.conceptsDone,
        testedOut: progress.testedOut,
        timeSavedMs: progress.timeSavedMs,
        capstoneProgress: progress.capstone?.stepsCompleted ?? 0,
        capstoneCurrentStep: progress.capstone?.currentStep ?? 0,
      },
      continueBuildingCard: progress.capstone
        ? {
            sessionId: progress.capstone.sessionId,
            currentStep: progress.capstone.currentStep,
            trackSlug: enrollment.track.slug,
          }
        : null,
    }));
  }),
});
