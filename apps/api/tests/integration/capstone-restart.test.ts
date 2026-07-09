import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { INTEGRATION, loadEnv } from "./helpers.js";
import type { Env } from "./helpers.js";

vi.mock("../../src/temporal/capstone-client.js", () => ({
  startCapstoneWorkflow: vi.fn(async () => undefined),
  signalLearnerActive: vi.fn(async () => undefined),
  signalVerifyStep: vi.fn(async () => undefined),
}));

describe.skipIf(!INTEGRATION)("Capstone session restart integration (T134)", () => {
  let env: Env;

  beforeAll(async () => {
    env = await loadEnv();
  });

  afterAll(async () => {
    await env?.close();
  });

  it("a completed session is not resumed — createSession starts a fresh one", async () => {
    const { user, enrollment } = await env.seedLearner({ concepts: 1 });
    await env.db.conceptState.updateMany({
      where: { enrollmentId: enrollment.id },
      data: { state: "mastered" },
    });
    const api = env.caller(user.id);

    const first = await api.capstone.createSession({ enrollmentId: enrollment.id });
    await env.db.capstoneSessions.update({
      where: { id: first.id },
      data: { completedAt: new Date() },
    });

    const second = await api.capstone.createSession({ enrollmentId: enrollment.id });

    expect(second.id).not.toBe(first.id);
    expect(second.currentStep).toBe(1);

    // getCapstone surfaces only the active (uncompleted) session
    const { session } = await api.capstone.getCapstone({ trackSlug: (await env.db.track.findUniqueOrThrow({ where: { id: enrollment.trackId } })).slug });
    expect(session?.id).toBe(second.id);
  });
});
