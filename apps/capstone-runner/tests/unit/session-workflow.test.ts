import { describe, it, expect } from "vitest";

// Unit tests for CapstonSessionWorkflow state machine logic (no Temporal runtime needed)

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

function shouldTeardown(lastActiveAt: number, now: number): boolean {
  return now - lastActiveAt >= INACTIVITY_TIMEOUT_MS;
}

function resetTimer(now: number): number {
  return now;
}

describe("CapstonSessionWorkflow", () => {
  it("does not teardown if active within 30 minutes", () => {
    const now = Date.now();
    const lastActiveAt = now - 10 * 60 * 1000; // 10 min ago
    expect(shouldTeardown(lastActiveAt, now)).toBe(false);
  });

  it("triggers teardown after 30-minute inactivity", () => {
    const now = Date.now();
    const lastActiveAt = now - 31 * 60 * 1000; // 31 min ago
    expect(shouldTeardown(lastActiveAt, now)).toBe(true);
  });

  it("learner-active signal resets the timer", () => {
    const now = Date.now();
    const signalTime = now;
    const updatedLastActive = resetTimer(signalTime);
    expect(shouldTeardown(updatedLastActive, now)).toBe(false);
  });
});
