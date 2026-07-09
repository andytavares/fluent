import { describe, it, expect, vi } from "vitest";
import { PlacementService } from "../../src/service/placement.js";

// Placement task scoring lives in SubmissionPipeline (kind "placement") and
// is covered by submission-pipeline.test.ts.

function makeMockDb() {
  return {
    enrollment: { findUniqueOrThrow: vi.fn() },
  };
}

describe("PlacementService.startPlacement", () => {
  it("returns the track's published concepts in position order", async () => {
    const db = makeMockDb();
    const concepts = [
      { id: "c1", position: 1 },
      { id: "c2", position: 2 },
    ];
    db.enrollment.findUniqueOrThrow.mockResolvedValue({ track: { concepts } });
    const service = new PlacementService(db as never);

    const result = await service.startPlacement("enr1");

    expect(result).toEqual(concepts);
    expect(db.enrollment.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "enr1" } }),
    );
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
