import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Test-out fail integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("failing test_out submission → in_progress with no penalty, no mastery event", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "test_out",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 2, stderr: "FAIL: TestX" });
    const { passed } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(false);
    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("in_progress");
    expect(await env.db.masteryEvent.count({ where: { enrollmentId: enrollment.id } })).toBe(0);
    // Nothing was mastered — the next concept stays locked
    expect((await env.conceptState(enrollment.id, concepts[1]!.id)).state).toBe("locked");
  });
});
