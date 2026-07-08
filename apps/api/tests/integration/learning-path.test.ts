import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Learning path integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("returns all concept states in position order and backfills late-added concepts", async () => {
    const { user, track, concepts, enrollment } = await env.seedLearner({ concepts: 2 });
    const api = env.caller(user.id);

    // A concept published after the learner enrolled
    const late = await env.db.concept.create({
      data: {
        trackId: track.id,
        slug: `late-${concepts[0]!.slug}`,
        title: "Late Concept",
        position: 3,
        status: "published",
      },
    });

    const states = await api.concepts.listConceptStates({ enrollmentId: enrollment.id });

    expect(states).toHaveLength(3);
    expect(states.map((s) => s.concept.position)).toEqual([1, 2, 3]);
    expect(states[0]!.state).toBe("available");
    expect(states[1]!.state).toBe("locked");
    expect(states.find((s) => s.conceptId === late.id)!.state).toBe("locked");
  });
});
