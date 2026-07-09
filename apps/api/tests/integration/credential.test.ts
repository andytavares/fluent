import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Credential integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("generates a credential whose summary counts test-outs, retrievable by token", async () => {
    const { user, track, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    // Master one concept via test-out so tested_out_count is non-zero
    const { submissionId } = await api.submissions.createSubmission({
      conceptId: concepts[0]!.id,
      enrollmentId: enrollment.id,
      code: "package main",
      isSuite: true,
      kind: "test_out",
    });
    await env.writeWorkerResult(submissionId, { exitCode: 0 });
    await api.submissions.completeSubmission({ submissionId });

    const credential = await api.profile.generateCredential({ trackSlug: track.slug });
    expect(credential.token).toBeTruthy();

    const summary = credential.summary as { tested_out_count: number; concepts_total: number; track_title: string };
    expect(summary.tested_out_count).toBe(1);
    expect(summary.concepts_total).toBe(2);
    expect(summary.track_title).toBe(track.title);

    const fetched = await api.profile.getCredential({ token: credential.token });
    expect(fetched.id).toBe(credential.id);
    expect(fetched.userId).toBe(user.id);
  });
});
