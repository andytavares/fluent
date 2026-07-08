import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

vi.mock("../../src/temporal/capstone-client.js", () => ({
  startCapstoneWorkflow: vi.fn(async () => undefined),
  signalLearnerActive: vi.fn(async () => undefined),
  signalVerifyStep: vi.fn(async () => undefined),
}));

describe.skipIf(!INTEGRATION)("Capstone resume integration", () => {
  let env: Env;
  let temporal: typeof import("../../src/temporal/capstone-client.js");

  beforeAll(async () => {
    env = await loadEnv();
    temporal = await import("../../src/temporal/capstone-client.js");
  });

  afterAll(async () => {
    await env?.close();
  });

  it("re-opening the capstone resumes the active session with completed steps intact", async () => {
    const { user, enrollment } = await env.seedLearner({ concepts: 1 });
    await env.db.conceptState.updateMany({
      where: { enrollmentId: enrollment.id },
      data: { state: "completed" },
    });
    const api = env.caller(user.id);

    const first = await api.capstone.createSession({ enrollmentId: enrollment.id });

    // Step 1 completed (written by the workflow's recordStepCompletion activity)
    await env.db.capstoneStepCompletion.create({
      data: { sessionId: first.id, stepNumber: 1, verificationResult: { passed: true } },
    });
    await env.db.capstoneSessions.update({ where: { id: first.id }, data: { currentStep: 2 } });

    vi.mocked(temporal.startCapstoneWorkflow).mockClear();

    // Browser closed, learner returns: createSession again for the same enrollment
    const resumed = await api.capstone.createSession({ enrollmentId: enrollment.id });

    expect(resumed.id).toBe(first.id);
    expect(resumed.currentStep).toBe(2);
    expect(resumed.stepCompletions.map((s: { stepNumber: number }) => s.stepNumber)).toEqual([1]);
    // Resuming must not start a second workflow
    expect(vi.mocked(temporal.startCapstoneWorkflow)).not.toHaveBeenCalled();
  });
});
