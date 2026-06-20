import { describe, it, expect } from "vitest";

// Pure mastery logic — no DB
function computeTimeSavedMs(events: Array<{ achievedVia: string; lessonAvgTimeMs: number | null }>): number {
  return events
    .filter((e) => e.achievedVia !== "lesson" && e.lessonAvgTimeMs !== null)
    .reduce((sum, e) => sum + (e.lessonAvgTimeMs ?? 0), 0);
}

describe("Mastery service", () => {
  it("computes time saved from placement mastery events", () => {
    const events = [
      { achievedVia: "placement", lessonAvgTimeMs: 600_000 },
      { achievedVia: "placement", lessonAvgTimeMs: 300_000 },
    ];
    expect(computeTimeSavedMs(events)).toBe(900_000);
  });

  it("computes time saved from test_out mastery events", () => {
    const events = [
      { achievedVia: "test_out", lessonAvgTimeMs: 480_000 },
    ];
    expect(computeTimeSavedMs(events)).toBe(480_000);
  });

  it("excludes lesson events from time saved", () => {
    const events = [
      { achievedVia: "lesson", lessonAvgTimeMs: 600_000 },
      { achievedVia: "test_out", lessonAvgTimeMs: 300_000 },
    ];
    expect(computeTimeSavedMs(events)).toBe(300_000);
  });

  it("returns 0 when no skipped events", () => {
    const events = [{ achievedVia: "lesson", lessonAvgTimeMs: 600_000 }];
    expect(computeTimeSavedMs(events)).toBe(0);
  });

  it("handles null lessonAvgTimeMs gracefully", () => {
    const events = [{ achievedVia: "test_out", lessonAvgTimeMs: null }];
    expect(computeTimeSavedMs(events)).toBe(0);
  });
});
