import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Test-out pass integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("startChallenge → passing test_out submission → concept mastered via test_out", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    const challenge = await api.testout.startChallenge({
      enrollmentId: enrollment.id,
      conceptId: concepts[0]!.id,
    });
    expect(challenge.durationMs).toBe(4 * 60 * 1000);
    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("in_progress");

    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      language: "go",
      isSuite: true,
      kind: "test_out",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    const { passed } = await api.submissions.completeSubmission({ submissionId });

    expect(passed).toBe(true);
    const state = await env.conceptState(enrollment.id, concepts[0]!.id);
    expect(state.state).toBe("mastered");
    expect(state.achievedVia).toBe("test_out");

    const events = await env.db.masteryEvent.findMany({ where: { enrollmentId: enrollment.id } });
    expect(events).toHaveLength(1);
    expect(events[0]!.achievedVia).toBe("test_out");

    // Mastery unlocks the next concept in sequence
    expect((await env.conceptState(enrollment.id, concepts[1]!.id)).state).toBe("available");
  });
});
