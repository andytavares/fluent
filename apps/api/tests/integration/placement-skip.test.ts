import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

describe.skipIf(!INTEGRATION)("Placement skip integration", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("skipping placement leaves every concept at its initialized state", async () => {
    const { user, concepts, enrollment } = await env.seedLearner({ concepts: 3 });
    const api = env.caller(user.id);

    const result = await api.placement.skipPlacement({ enrollmentId: enrollment.id });
    expect(result).toEqual({ enrollmentId: enrollment.id, skipped: true });

    expect((await env.conceptState(enrollment.id, concepts[0]!.id)).state).toBe("available");
    expect((await env.conceptState(enrollment.id, concepts[1]!.id)).state).toBe("locked");
    expect((await env.conceptState(enrollment.id, concepts[2]!.id)).state).toBe("locked");
  });
});
