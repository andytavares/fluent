import { router, protectedProcedure } from "./trpc.js";

export const dashboardRouter = router({
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;

    const enrollments = await ctx.db.enrollment.findMany({
      where: { userId },
      include: {
        track: true,
        conceptStates: { include: { concept: { select: { lessonAvgTimeMs: true } } } },
        masteryEvents: true,
        capstoneSessions: {
          where: { completedAt: null },
          include: { stepCompletions: { orderBy: { stepNumber: "asc" } } },
          take: 1,
          orderBy: { startedAt: "desc" },
        },
      },
    });

    return enrollments.map((enrollment) => {
      const conceptsDone = enrollment.conceptStates.filter(
        (cs: (typeof enrollment.conceptStates)[number]) =>
          cs.state === "mastered" || cs.state === "completed",
      ).length;
      const testedOut = enrollment.masteryEvents.filter(
        (me: (typeof enrollment.masteryEvents)[number]) => me.achievedVia === "test_out",
      ).length;
      const timeSavedMs = enrollment.masteryEvents
        .filter(
          (me: (typeof enrollment.masteryEvents)[number]) =>
            me.achievedVia !== "lesson" && me.lessonAvgTimeMs,
        )
        .reduce(
          (sum: number, me: (typeof enrollment.masteryEvents)[number]) =>
            sum + (me.lessonAvgTimeMs ?? 0),
          0,
        );

      const activeSession = enrollment.capstoneSessions[0] ?? null;
      const capstoneCurrentStep = activeSession?.currentStep ?? 0;
      const capstoneStepsCompleted = activeSession?.stepCompletions.length ?? 0;

      return {
        enrollment,
        track: enrollment.track,
        stats: {
          conceptsDone,
          testedOut,
          timeSavedMs,
          capstoneProgress: capstoneStepsCompleted,
          capstoneCurrentStep,
        },
        continueBuildingCard: activeSession
          ? {
              sessionId: activeSession.id,
              currentStep: activeSession.currentStep,
              trackSlug: enrollment.track.slug,
            }
          : null,
      };
    });
  }),
});
