import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

vi.mock("../../src/temporal/capstone-client.js", () => ({
  startCapstoneWorkflow: vi.fn(async () => undefined),
  signalLearnerActive: vi.fn(async () => undefined),
  signalVerifyStep: vi.fn(async () => undefined),
}));

describe.skipIf(!INTEGRATION)("Enrollment reset integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("resetEnrollment cascades every progress table from the enrollment row", async () => {
    const { user, track, concepts, enrollment } = await env.seedLearner({ concepts: 1 });
    const api = env.caller(user.id);

    // Real progress: a passing lesson submission (row + mastery event + state)
    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId });

    // A capstone session with a completed step
    const session = await api.capstone.createSession({ enrollmentId: enrollment.id });
    await env.db.capstoneStepCompletion.create({
      data: { sessionId: session.id, stepNumber: 1, verificationResult: { passed: true } },
    });

    const result = await api.enrollments.resetEnrollment({ trackId: track.id });
    expect(result).toEqual({ reset: true });

    expect(await env.db.enrollment.findUnique({ where: { id: enrollment.id } })).toBeNull();
    expect(await env.db.conceptState.count({ where: { enrollmentId: enrollment.id } })).toBe(0);
    expect(await env.db.masteryEvent.count({ where: { enrollmentId: enrollment.id } })).toBe(0);
    expect(await env.db.submission.count({ where: { enrollmentId: enrollment.id } })).toBe(0);
    expect(await env.db.capstoneSessions.count({ where: { enrollmentId: enrollment.id } })).toBe(0);
    expect(await env.db.capstoneStepCompletion.count({ where: { sessionId: session.id } })).toBe(0);
  });
});
