import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestoutService } from "../../src/service/testout.js";

function makeMockDb(stateOverride: string = "in_progress") {
  return {
    conceptState: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "cs1", state: stateOverride }),
      update: vi.fn().mockResolvedValue({ id: "cs1", state: "in_progress" }),
    },
    concept: { findUniqueOrThrow: vi.fn().mockResolvedValue({ lessonAvgTimeMs: null }) },
    masteryEvent: { create: vi.fn().mockResolvedValue({ id: "me1" }) },
  };
}

describe("TestoutService.submitChallenge", () => {
  it("timer expired when available → transitions to in_progress", async () => {
    const db = makeMockDb("available");
    const service = new TestoutService(db as never);

    const result = await service.submitChallenge({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      code: "",
      timerExpired: true,
    });

    expect(result).toEqual({ result: "timer_expired", conceptState: "in_progress" });
    expect(db.conceptState.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: "in_progress" }) }),
    );
  });

  it("timer expired when already in_progress → does not re-transition", async () => {
    const db = makeMockDb("in_progress");
    const service = new TestoutService(db as never);

    const result = await service.submitChallenge({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      code: "",
      timerExpired: true,
    });

    expect(result).toEqual({ result: "timer_expired", conceptState: "in_progress" });
    expect(db.conceptState.update).not.toHaveBeenCalled();
  });

  it("non-expired → returns pending", async () => {
    const db = makeMockDb("in_progress");
    const service = new TestoutService(db as never);

    const result = await service.submitChallenge({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      code: "some code",
      timerExpired: false,
    });

    expect(result).toEqual({ result: "pending", conceptState: "in_progress" });
  });
});

describe("TestoutService.applyTestoutResult", () => {
  it("pass → mastered", async () => {
    const db = makeMockDb("in_progress");
    db.conceptState.update.mockResolvedValue({ id: "cs1", state: "mastered" });
    const service = new TestoutService(db as never);

    const result = await service.applyTestoutResult("enr1", "con1", "usr1", true);
    expect(result).toEqual({ conceptState: "mastered" });
  });

  it("fail → in_progress (no penalty)", async () => {
    const db = makeMockDb("in_progress");
    const service = new TestoutService(db as never);

    const result = await service.applyTestoutResult("enr1", "con1", "usr1", false);
    expect(result).toEqual({ conceptState: "in_progress" });
  });
});
