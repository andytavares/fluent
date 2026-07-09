import { describe, it, expect, vi } from "vitest";
import { CAPSTONE_INACTIVITY_TIMEOUT_MS } from "@fluent/capstone-contract";
import {
  recordProvisionedWith,
  recordStepCompletionWith,
  markSessionCompletedWith,
} from "../../src/activities/session.js";

function makeMockDb() {
  return {
    capstoneSessions: {
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    capstoneStepCompletion: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
  };
}

describe("recordProvisioned", () => {
  it("persists job name, encrypted connection, and the expiry window", async () => {
    const db = makeMockDb();
    const before = Date.now();

    await recordProvisionedWith(db as never, {
      sessionId: "s1",
      jobName: "capstone-s1",
      encryptedConn: "iv:tag:cipher",
    });

    expect(db.capstoneSessions.update).toHaveBeenCalledOnce();
    const { where, data } = db.capstoneSessions.update.mock.calls[0]![0] as {
      where: { id: string };
      data: { k8sJobName: string; dbConnectionEncrypted: string; dbProvisionedAt: Date; dbExpiresAt: Date };
    };
    expect(where).toEqual({ id: "s1" });
    expect(data.k8sJobName).toBe("capstone-s1");
    expect(data.dbConnectionEncrypted).toBe("iv:tag:cipher");
    expect(data.dbExpiresAt.getTime() - data.dbProvisionedAt.getTime()).toBe(CAPSTONE_INACTIVITY_TIMEOUT_MS);
    expect(data.dbProvisionedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("recordStepCompletion", () => {
  it("upserts the completion and advances currentStep past the verified step, atomically", async () => {
    const db = makeMockDb();

    await recordStepCompletionWith(db as never, {
      sessionId: "s1",
      stepNumber: 3,
      verificationResult: { passed: true, http_tests: [] },
    });

    expect(db.$transaction).toHaveBeenCalledOnce();
    expect(db.capstoneStepCompletion.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId_stepNumber: { sessionId: "s1", stepNumber: 3 } },
      }),
    );
    expect(db.capstoneSessions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // forward-only: re-verifying step 3 after reaching step 5 must not regress
        where: { id: "s1", currentStep: { lte: 3 } },
        data: expect.objectContaining({ currentStep: 4 }),
      }),
    );
  });
});

describe("markSessionCompleted", () => {
  it("closes only sessions that are still open, tolerating missing rows", async () => {
    const db = makeMockDb();

    await markSessionCompletedWith(db as never, "s1");

    expect(db.capstoneSessions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "s1", completedAt: null },
        data: expect.objectContaining({ completedAt: expect.any(Date) }),
      }),
    );
  });
});
