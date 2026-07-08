import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Dashboard integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("reflects a test-out mastery in conceptsDone, testedOut, and timeSavedMs", async () => {
    const { user, track, concepts, enrollment } = await env.seedLearner({
      concepts: 2,
      lessonAvgTimeMs: 600_000,
    });
    const api = env.caller(user.id);

    // Master concept 1 via test-out through the shipping pipeline
    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
      kind: "test_out",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId });

    const dashboard = await api.dashboard.getDashboard();
    const card = dashboard.find((d) => d.track.id === track.id);

    expect(card).toBeDefined();
    expect(card!.stats.conceptsDone).toBe(1);
    expect(card!.stats.testedOut).toBe(1);
    expect(card!.stats.timeSavedMs).toBe(600_000);
    expect(card!.continueBuildingCard).toBeNull();
  });
});
