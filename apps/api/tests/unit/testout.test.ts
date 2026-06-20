import { describe, it, expect } from "vitest";

// Pure test-out state machine (no DB)
type TestoutResult = "mastered" | "in_progress";

function applyTestoutOutcome(passed: boolean, timerExpired: boolean): TestoutResult {
  if (timerExpired) return "in_progress";
  if (passed) return "mastered";
  return "in_progress";
}

describe("Test-out service", () => {
  it("pass within time → mastered", () => {
    expect(applyTestoutOutcome(true, false)).toBe("mastered");
  });

  it("fail within time → in_progress (no penalty)", () => {
    expect(applyTestoutOutcome(false, false)).toBe("in_progress");
  });

  it("timer expired → in_progress (no penalty)", () => {
    expect(applyTestoutOutcome(false, true)).toBe("in_progress");
  });

  it("timer expired even if passing code → in_progress (expired takes priority)", () => {
    expect(applyTestoutOutcome(true, true)).toBe("in_progress");
  });
});
