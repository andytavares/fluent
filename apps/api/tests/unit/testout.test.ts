import { describe, it, expect, vi } from "vitest";
import { TestoutService } from "../../src/service/testout.js";

// Test-out submission scoring lives in SubmissionPipeline (kind "test_out")
// and is covered by submission-pipeline.test.ts.

function makeMockDb(stateOverride: string = "in_progress") {
  return {
    conceptState: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "cs1", state: stateOverride }),
      update: vi.fn().mockResolvedValue({ id: "cs1", state: "in_progress" }),
    },
  };
}

describe("TestoutService.startChallenge", () => {
  it("transitions available → in_progress and returns the timer window", async () => {
    const db = makeMockDb("available");
    const service = new TestoutService(db as never);

    const result = await service.startChallenge("enr1", "con1");

    expect(result.conceptId).toBe("con1");
    expect(result.durationMs).toBe(4 * 60 * 1000);
    expect(db.conceptState.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: "in_progress" }) }),
    );
  });

  it("does not re-transition when already in_progress", async () => {
    const db = makeMockDb("in_progress");
    const service = new TestoutService(db as never);

    await service.startChallenge("enr1", "con1");

    expect(db.conceptState.update).not.toHaveBeenCalled();
  });
});
