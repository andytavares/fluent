import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreakService } from "../../src/service/streak.js";

function makeMockDb(submissions: Array<{ createdAt: Date }> = []) {
  return {
    submission: {
      findMany: vi.fn().mockResolvedValue(submissions),
    },
  };
}

describe("StreakService.getCurrentStreak", () => {
  it("returns 0 with no submissions", async () => {
    const service = new StreakService(makeMockDb() as never);
    expect(await service.getCurrentStreak("usr1")).toBe(0);
  });

  it("counts today as 1-day streak", async () => {
    const db = makeMockDb([{ createdAt: new Date() }]);
    const service = new StreakService(db as never);
    expect(await service.getCurrentStreak("usr1")).toBe(1);
  });

  it("same day multiple submissions = still 1", async () => {
    const now = new Date();
    const db = makeMockDb([{ createdAt: now }, { createdAt: new Date(now.getTime() - 1000) }]);
    const service = new StreakService(db as never);
    expect(await service.getCurrentStreak("usr1")).toBe(1);
  });

  it("submission 3 days ago with no today submission = 0 streak", async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000);
    const db = makeMockDb([{ createdAt: threeDaysAgo }]);
    const service = new StreakService(db as never);
    expect(await service.getCurrentStreak("usr1")).toBe(0);
  });
});
