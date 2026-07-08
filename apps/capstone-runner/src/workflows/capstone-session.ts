import {
  proxyActivities,
  setHandler,
  defineSignal,
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
export const verifyStepSignal = defineSignal<[number]>("verify-step");

export async function capstoneSessionWorkflow({ sessionId }: { sessionId: string }) {
  let lastActiveAt = Date.now();
  let learnerActive = false;
  const verifyQueue: number[] = [];

  setHandler(learnerActiveSignal, () => {
    learnerActive = true;
    lastActiveAt = Date.now();
  });

  setHandler(verifyStepSignal, (stepNumber: number) => {
    verifyQueue.push(stepNumber);
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
      () => learnerActive || verifyQueue.length > 0,
      INACTIVITY_TIMEOUT_MS,
    ).then(() => false).catch(() => true);

    if (timedOut) {
      break;
    }

    lastActiveAt = Date.now();

    // Process any pending verification requests
    while (verifyQueue.length > 0) {
      const stepNumber = verifyQueue.shift()!;
      const verifyScriptPath = `/verify/step${stepNumber}.sh`;
      const result = await activities.verify({ sessionId, stepNumber, verifyScriptPath });
      if (result.passed) {
        await activities.recordStepCompletion({ sessionId, stepNumber, verificationResult: result });
      }
    }
  }

  // Teardown the K8s Job
  await activities.teardown({ sessionId });
}

export { CapstonSessionWorkflow };
type CapstonSessionWorkflow = typeof capstoneSessionWorkflow;
