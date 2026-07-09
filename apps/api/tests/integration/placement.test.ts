import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Placement integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("passing placement submission marks the concept mastered via placement", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    const tasks = await api.placement.startPlacement({ enrollmentId: enrollment.id });
    expect(tasks).toHaveLength(2);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "placement",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    const { passed } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(true);
    const state = await env.conceptState(enrollment.id, concepts[0]!.id);
    expect(state.state).toBe("mastered");
    expect(state.achievedVia).toBe("placement");
    // No lesson mastery event is recorded for placement (state transition only)
    expect(await env.db.masteryEvent.count({ where: { enrollmentId: enrollment.id, achievedVia: "lesson" } })).toBe(0);
  });

  it("failing placement submission leaves the concept available for the lesson path", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 1 });
    const api = env.caller(user.id);

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "placement",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 1 });
    const { passed } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(false);
    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("available");
  });
});
