import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

// The Temporal client is the adapter at the workflow seam — mocked here; the
// workflow itself is tested in apps/capstone-runner against a real test server.
vi.mock("../../src/temporal/capstone-client.js", () => ({
  startCapstoneWorkflow: vi.fn(async () => undefined),
  signalLearnerActive: vi.fn(async () => undefined),
  signalVerifyStep: vi.fn(async () => undefined),
}));

describe.skipIf(!INTEGRATION)("Capstone integration", () => {
  let env: Env;
  let temporal: typeof import("../../src/temporal/capstone-client.js");

  beforeAll(async () => {
    env = await loadEnv();
    temporal = await import("../../src/temporal/capstone-client.js");
  });

  afterAll(async () => {
    await env?.close();
  });

  it("rejects createSession while concepts are unmastered", async () => {
    const { user, enrollment } = await env.seedLearner({ concepts: 2 });

    await expect(
      env.caller(user.id).capstone.createSession({ enrollmentId: enrollment.id }),
    ).rejects.toMatchObject({ code: "UNPROCESSABLE_CONTENT" });
  });

  it("creates a session and starts the workflow once all concepts are done", async () => {
    const { user, enrollment } = await env.seedLearner({ concepts: 2 });
    await env.db.conceptState.updateMany({
      where: { enrollmentId: enrollment.id },
      data: { state: "completed" },
    });
    const api = env.caller(user.id);

    const session = await api.capstone.createSession({ enrollmentId: enrollment.id });

    expect(session.enrollmentId).toBe(enrollment.id);
    const track = await env.db.track.findUniqueOrThrow({ where: { id: enrollment.trackId } });
    expect(vi.mocked(temporal.startCapstoneWorkflow)).toHaveBeenCalledWith(session.id, track.slug);

    const status = await api.capstone.getSessionStatus({ sessionId: session.id });
    expect(status.currentStep).toBe(1);
    expect(status.stepCompletions).toHaveLength(0);
  });

  it("verifyStep signals the workflow and reports pending; completion shows up via polling", async () => {
    const { user, enrollment } = await env.seedLearner({ concepts: 1 });
    await env.db.conceptState.updateMany({
      where: { enrollmentId: enrollment.id },
      data: { state: "mastered" },
    });
    const api = env.caller(user.id);
    const session = await api.capstone.createSession({ enrollmentId: enrollment.id });

    const result = await api.capstone.verifyStep({ sessionId: session.id, stepNumber: 1 });

    expect(result.status).toBe("pending");
    expect(vi.mocked(temporal.signalLearnerActive)).toHaveBeenCalledWith(session.id);
    expect(vi.mocked(temporal.signalVerifyStep)).toHaveBeenCalledWith(session.id, 1);

    // The workflow's recordStepCompletion activity writes the row; simulate it
    // and confirm the poll surface reflects it.
    await env.db.capstoneStepCompletion.create({
      data: { sessionId: session.id, stepNumber: 1, verificationResult: { passed: true } },
    });
    const status = await api.capstone.getSessionStatus({ sessionId: session.id });
    expect(status.stepCompletions.map((s) => s.stepNumber)).toEqual([1]);
  });
});
