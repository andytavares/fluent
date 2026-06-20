import { describe, it, expect } from "vitest";

// Placement scoring rules (pure logic — no DB required)
function scorePlacementTask(passed: boolean): "mastered" | "available" {
  return passed ? "mastered" : "available";
}

function placementTaskCount(totalConcepts: number): number {
  const MIN = 5;
  const MAX = 8;
  return Math.min(Math.max(MIN, Math.floor(totalConcepts * 0.5)), MAX);
}

describe("Placement scoring service", () => {
  it("pass → mastered", () => {
    expect(scorePlacementTask(true)).toBe("mastered");
  });

  it("fail → available (no penalty)", () => {
    expect(scorePlacementTask(false)).toBe("available");
  });

  it("placement task count is between 5 and 8 for a 10-concept track", () => {
    const count = placementTaskCount(10);
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(8);
  });

  it("placement task count is exactly 5 for a 4-concept track (min floor)", () => {
    const count = placementTaskCount(4);
    expect(count).toBe(5);
  });

  it("placement task count is exactly 8 for a 20-concept track (max cap)", () => {
    const count = placementTaskCount(20);
    expect(count).toBe(8);
  });
});
