import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Profile mastery integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("getMastery returns the per-concept table after a mixed lesson + test-out run", async () => {
    const { user, track, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    // Concept 1: completed via lesson
    const lesson = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
      kind: "lesson",
    });
    await env.writeWorkerResult(lesson.submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId: lesson.submissionId });

    // Concept 2: mastered via test-out
    const testout = await api.submissions.createSubmission({
      conceptId: concepts[1]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
      kind: "test_out",
    });
    await env.writeWorkerResult(testout.submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId: testout.submissionId });

    const mastery = await api.profile.getMastery({ trackSlug: track.slug });

    expect(mastery).toHaveLength(2);
    expect(mastery[0]!.state).toBe("completed");
    expect(mastery[0]!.achievedVia).toBe("lesson");
    expect(mastery[1]!.state).toBe("mastered");
    expect(mastery[1]!.achievedVia).toBe("test_out");
  });
});
