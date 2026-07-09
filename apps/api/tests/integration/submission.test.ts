import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Submission integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("lesson suite pass → submission stored, concept completed, next concept unlocked", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "lesson",
    });

    await env.writeWorkerResult(submissionId, { exitCode: 0, stdout: "--- PASS: TestX" });
    const { passed, submission } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(true);
    expect(submission.stdout).toContain("PASS");
    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("completed");
    expect((await env.conceptState(enrollment.id, concepts[1]!.id)).state).toBe("available");
  });

  it("lesson suite fail → verdict false, concept state unchanged", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 1 });
    const api = env.caller(user.id);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "lesson",
    });

    await env.writeWorkerResult(submissionId, { exitCode: 1, stderr: "FAIL" });
    const { passed } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(false);
    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("available");
  });

  it("finalize is idempotent: repeating completeSubmission returns the stored verdict", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 1 });
    const api = env.caller(user.id);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
    });

    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId });
    const second = await api.submissions.completeSubmission({ submissionId });

    expect(second.passed).toBe(true);
    const events = await env.db.masteryEvent.findMany({ where: { enrollmentId: enrollment.id } });
    expect(events).toHaveLength(1);
  });

  it("a different user cannot finalize someone else's submission", async () => {
    const learner = await env.seedLearner({ concepts: 1 });
    const intruder = await env.seedLearner({ concepts: 1 });

    const { submissionId } = await env.caller(learner.user.id).submissions.createSubmission({
      conceptId: learner.concepts[0]!.id,
      enrollmentId: learner.enrollment.id,
      code: "package main",
      isSuite: true,
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });

    await expect(
      env.caller(intruder.user.id).submissions.completeSubmission({ submissionId }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
