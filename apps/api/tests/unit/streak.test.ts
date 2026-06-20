import { describe, it, expect } from "vitest";

// Pure streak logic (no DB required)
function computeStreak(submissionDates: string[]): number {
  if (submissionDates.length === 0) return 0;

  const days = new Set(submissionDates.map((d) => d.split("T")[0]!));
  const sortedDays = [...days].sort().reverse();

  const today = new Date().toISOString().split("T")[0]!;
  let streak = 0;
  let expected = today;

  for (const day of sortedDays) {
    if (day === expected) {
      streak++;
      const d = new Date(expected);
      d.setUTCDate(d.getUTCDate() - 1);
      expected = d.toISOString().split("T")[0]!;
    } else {
      break;
    }
  }

  return streak;
}

describe("Streak service", () => {
  it("returns 0 with no submissions", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("counts today as 1-day streak", () => {
    const today = new Date().toISOString();
    expect(computeStreak([today])).toBe(1);
  });

  it("same day multiple submissions = still 1", () => {
    const today = new Date().toISOString();
    const today2 = new Date(Date.now() - 1000).toISOString();
    expect(computeStreak([today, today2])).toBe(1);
  });

  it("misses a day resets streak to 0 for old submissions", () => {
    // submission was 3 days ago, not today — streak = 0 (today has none)
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
    expect(computeStreak([threeDaysAgo])).toBe(0);
  });
});
