import {
  proxyActivities,
  setHandler,
  defineSignal,
  sleep,
  condition,
} from "@temporalio/workflow";
import type { createActivities } from "../activities/index.js";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

type Activities = ReturnType<typeof createActivities>;

const activities = proxyActivities<Activities>({
  startToCloseTimeout: "5 minutes",
  retry: { maximumAttempts: 3 },
});

export const learnerActiveSignal = defineSignal("learner-active");

export async function capstonSessionWorkflow({ sessionId }: { sessionId: string }) {
  let lastActiveAt = Date.now();
  let learnerActive = false;

  setHandler(learnerActiveSignal, () => {
    learnerActive = true;
    lastActiveAt = Date.now();
  });

  // Provision the K8s Job + Postgres sidecar
  await activities.provision({ sessionId });

  // Run until inactivity timeout
  while (true) {
    learnerActive = false;

    // Wait for either learner activity or timeout
    const timedOut = await condition(
      () => learnerActive,
      INACTIVITY_TIMEOUT_MS,
    ).then(() => false).catch(() => true);

    if (timedOut) {
      break;
    }

    // Reset timer on learner activity
    lastActiveAt = Date.now();
  }

  // Teardown the K8s Job
  await activities.teardown({ sessionId });
}

export { CapstonSessionWorkflow };
type CapstonSessionWorkflow = typeof capstonSessionWorkflow;
