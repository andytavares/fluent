import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlacementService } from "../../src/service/placement.js";

function makeMockDb() {
  return {
    enrollment: { findUniqueOrThrow: vi.fn() },
    conceptState: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  };
}

describe("PlacementService.scoreTask", () => {
  let db: ReturnType<typeof makeMockDb>;
  let service: PlacementService;

  beforeEach(() => {
    db = makeMockDb();
    service = new PlacementService(db as never);
  });

  it("pass → transitions to mastered and returns mastered", async () => {
    db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "available" });
    db.conceptState.update.mockResolvedValue({ id: "cs1", state: "mastered" });

    const result = await service.scoreTask("enr1", "con1", true);

    expect(result).toEqual({ conceptId: "con1", result: "mastered" });
    expect(db.conceptState.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: "mastered" }) }),
    );
  });

  it("fail → returns available without transitioning", async () => {
    const result = await service.scoreTask("enr1", "con1", false);

    expect(result).toEqual({ conceptId: "con1", result: "available" });
    expect(db.conceptState.update).not.toHaveBeenCalled();
  });
});

describe("PlacementService.skipPlacement", () => {
  it("returns skipped: true with the enrollmentId", async () => {
    const db = makeMockDb();
    const service = new PlacementService(db as never);
    const result = await service.skipPlacement("enr1");
    expect(result).toEqual({ enrollmentId: "enr1", skipped: true });
  });
});
