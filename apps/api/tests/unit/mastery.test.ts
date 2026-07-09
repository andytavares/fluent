import { describe, it, expect, vi, beforeEach } from "vitest";
import { MasteryService } from "../../src/service/mastery.js";

function makeMockDb(overrides: Record<string, unknown> = {}) {
  return {
    // findFirst: unlockNext looks for the next concept after a terminal
    // transition; resolving undefined means "no next concept".
    concept: { findUniqueOrThrow: vi.fn(), findFirst: vi.fn() },
    conceptState: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
    masteryEvent: { create: vi.fn() },
    ...overrides,
  };
}

describe("MasteryService.createMasteryEvent", () => {
  let db: ReturnType<typeof makeMockDb>;
  let service: MasteryService;

  beforeEach(() => {
    db = makeMockDb();
    service = new MasteryService(db as never);
  });

  it("transitions to completed and creates mastery event for lesson achievedVia", async () => {
    db.concept.findUniqueOrThrow.mockResolvedValue({ lessonAvgTimeMs: 600_000 });
    db.conceptState.findUnique.mockResolvedValue({ state: "in_progress" });
    db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "in_progress" });
    db.conceptState.update.mockResolvedValue({ id: "cs1", state: "completed" });
    db.masteryEvent.create.mockResolvedValue({ id: "me1" });

    await service.createMasteryEvent({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      achievedVia: "lesson",
    });

    expect(db.conceptState.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: "completed" }) }),
    );
    expect(db.masteryEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ achievedVia: "lesson", lessonAvgTimeMs: null }) }),
    );
  });

  it("transitions to mastered for test_out and captures lessonAvgTimeMs", async () => {
    db.concept.findUniqueOrThrow.mockResolvedValue({ lessonAvgTimeMs: 480_000 });
    db.conceptState.findUnique.mockResolvedValue({ state: "in_progress" });
    db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "in_progress" });
    db.conceptState.update.mockResolvedValue({ id: "cs1", state: "mastered" });
    db.masteryEvent.create.mockResolvedValue({ id: "me1" });

    await service.createMasteryEvent({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      achievedVia: "test_out",
    });

    expect(db.masteryEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lessonAvgTimeMs: 480_000 }) }),
    );
  });

  it("skips transition if already in terminal state (mastered)", async () => {
    db.concept.findUniqueOrThrow.mockResolvedValue({ lessonAvgTimeMs: null });
    db.conceptState.findUnique.mockResolvedValue({ state: "mastered" });
    db.masteryEvent.create.mockResolvedValue({ id: "me1" });

    await service.createMasteryEvent({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      achievedVia: "lesson",
    });

    expect(db.conceptState.update).not.toHaveBeenCalled();
  });

  it("auto-advances available → in_progress → completed for lesson when concept not yet opened", async () => {
    db.concept.findUniqueOrThrow.mockResolvedValue({ lessonAvgTimeMs: null });
    db.conceptState.findUnique.mockResolvedValue({ state: "available" });
    // First call: findUniqueOrThrow for available → in_progress; second: for in_progress → completed
    db.conceptState.findUniqueOrThrow
      .mockResolvedValueOnce({ id: "cs1", state: "available" })
      .mockResolvedValueOnce({ id: "cs1", state: "in_progress" });
    db.conceptState.update.mockResolvedValue({ id: "cs1", state: "in_progress" });
    db.masteryEvent.create.mockResolvedValue({ id: "me1" });

    await service.createMasteryEvent({
      enrollmentId: "enr1",
      conceptId: "con1",
      userId: "usr1",
      achievedVia: "lesson",
    });

    expect(db.conceptState.update).toHaveBeenCalledTimes(2);
  });
});
