import {
  proxyActivities,
  setHandler,
  defineSignal,
  condition,
} from "@temporalio/workflow";
import {
  LEARNER_ACTIVE_SIGNAL,
  VERIFY_STEP_SIGNAL,
  CAPSTONE_INACTIVITY_TIMEOUT_MS,
} from "@fluent/capstone-contract";
import type { CapstoneSessionInput } from "@fluent/capstone-contract";
import type { createActivities } from "../activities/index.js";

type Activities = ReturnType<typeof createActivities>;

const activities = proxyActivities<Activities>({
  startToCloseTimeout: "5 minutes",
  retry: { maximumAttempts: 3 },
});

export const learnerActiveSignal = defineSignal(LEARNER_ACTIVE_SIGNAL);
export const verifyStepSignal = defineSignal<[number]>(VERIFY_STEP_SIGNAL);

export async function capstoneSessionWorkflow({ sessionId }: CapstoneSessionInput) {
  let learnerActive = false;
  const verifyQueue: number[] = [];

  setHandler(learnerActiveSignal, () => {
    learnerActive = true;
  });

  setHandler(verifyStepSignal, (stepNumber: number) => {
    verifyQueue.push(stepNumber);
    learnerActive = true;
  });

  // Provision the K8s Job + Postgres sidecar, then persist its identity and
  // encrypted connection string on the session row — the UI derives its
  // "connected" status from that write.
  const provisioned = await activities.provision({ sessionId });
  await activities.recordProvisioned({ sessionId, ...provisioned });

  // Run until inactivity timeout
  while (true) {
    learnerActive = false;

    // condition() resolves true when learner activity arrives, false when the
    // inactivity timeout elapses (it never rejects).
    const active = await condition(
      () => learnerActive || verifyQueue.length > 0,
      CAPSTONE_INACTIVITY_TIMEOUT_MS,
    );

    if (!active) {
      break;
    }

    // Process any pending verification requests; the verifier resolves the
    // step's verify.sh from authored content (content/capstone/…).
    while (verifyQueue.length > 0) {
      const stepNumber = verifyQueue.shift()!;
      const result = await activities.verify({ sessionId, stepNumber });
      if (result.passed) {
        await activities.recordStepCompletion({ sessionId, stepNumber, verificationResult: result });
      }
    }
  }

  // Teardown the K8s Job
  await activities.teardown({ sessionId });
}
