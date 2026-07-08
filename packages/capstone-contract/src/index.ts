// Contract for the capstone session workflow, shared by the API (Temporal
// client) and the capstone-runner (Temporal worker). Both sides adapt to this
// seam; neither imports the other's internals.

export const CAPSTONE_TASK_QUEUE = "capstone-sessions";

/** Workflow type name registered by the worker and started by the API. */
export const CAPSTONE_WORKFLOW_TYPE = "capstoneSessionWorkflow";

export const LEARNER_ACTIVE_SIGNAL = "learner-active";
export const VERIFY_STEP_SIGNAL = "verify-step";

export interface CapstoneSessionInput {
  sessionId: string;
}

/** Signature of the capstone session workflow function. */
export type CapstoneSessionWorkflow = (input: CapstoneSessionInput) => Promise<void>;

export function capstoneWorkflowId(sessionId: string): string {
  return `capstone-session-${sessionId}`;
}
