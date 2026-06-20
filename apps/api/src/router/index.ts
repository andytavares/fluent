import { router } from "./trpc.js";
import { tracksRouter } from "./tracks.js";
import { enrollmentsRouter } from "./enrollments.js";
import { placementRouter } from "./placement.js";
import { conceptsRouter } from "./concepts.js";
import { submissionsRouter } from "./submissions.js";
import { testoutRouter } from "./testout.js";
import { capstoneRouter } from "./capstone.js";
import { dashboardRouter } from "./dashboard.js";
import { profileRouter } from "./profile.js";
import { internalRouter } from "./internal.js";

export const appRouter = router({
  tracks: tracksRouter,
  enrollments: enrollmentsRouter,
  placement: placementRouter,
  concepts: conceptsRouter,
  submissions: submissionsRouter,
  testout: testoutRouter,
  capstone: capstoneRouter,
  dashboard: dashboardRouter,
  profile: profileRouter,
  internal: internalRouter,
});

export type AppRouter = typeof appRouter;
