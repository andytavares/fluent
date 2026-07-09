import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import type { WorkflowHandle } from "@temporalio/client";
import {
  CAPSTONE_WORKFLOW_TYPE,
  LEARNER_ACTIVE_SIGNAL,
  VERIFY_STEP_SIGNAL,
  capstoneWorkflowId,
} from "@fluent/capstone-contract";

// Tests the workflow through its shipping interface — the workflow type,
// signals, and activity calls — in Temporal's time-skipping test environment.
// The 30-minute inactivity timer elapses in milliseconds of real time.

const WORKFLOWS_PATH = fileURLToPath(new URL("../../src/workflows/index.ts", import.meta.url));
const TASK_QUEUE = "test-capstone-sessions";

let testEnv: TestWorkflowEnvironment;

beforeAll(async () => {
  testEnv = await TestWorkflowEnvironment.createTimeSkipping();
}, 120_000);

afterAll(async () => {
  await testEnv?.teardown();
});

function makeActivities(verifyPassed = true) {
  return {
    provision: vi.fn(async () => ({ jobName: "capstone-job", encryptedConn: "iv:tag:cipher" })),
    recordProvisioned: vi.fn(async () => undefined),
    verify: vi.fn(async () => ({ passed: verifyPassed, http_tests: [] })),
    teardown: vi.fn(async () => undefined),
    recordStepCompletion: vi.fn(async () => undefined),
  };
}

async function runSession(
  activities: ReturnType<typeof makeActivities>,
  interact?: (handle: WorkflowHandle) => Promise<void>,
): Promise<void> {
  const worker = await Worker.create({
    connection: testEnv.nativeConnection,
    taskQueue: TASK_QUEUE,
    workflowsPath: WORKFLOWS_PATH,
    activities,
  });

  await worker.runUntil(async () => {
    const handle = await testEnv.client.workflow.start(CAPSTONE_WORKFLOW_TYPE, {
      taskQueue: TASK_QUEUE,
      workflowId: capstoneWorkflowId(randomUUID()),
      args: [{ sessionId: "sess-1" }],
    });
    if (interact) await interact(handle);
    await handle.result();
  });
}

describe("capstoneSessionWorkflow", () => {
  it("provisions, persists the provision output, then tears down after the 30-minute inactivity timeout", async () => {
    const activities = makeActivities();

    await runSession(activities);

    expect(activities.provision).toHaveBeenCalledWith({ sessionId: "sess-1" });
    expect(activities.recordProvisioned).toHaveBeenCalledWith({
      sessionId: "sess-1",
      jobName: "capstone-job",
      encryptedConn: "iv:tag:cipher",
    });
    expect(activities.teardown).toHaveBeenCalledWith({ sessionId: "sess-1" });
    expect(activities.verify).not.toHaveBeenCalled();
  }, 120_000);

  it("verify-step signal runs the verifier and records a passing step", async () => {
    const activities = makeActivities(true);

    await runSession(activities, async (handle) => {
      await handle.signal(VERIFY_STEP_SIGNAL, 2);
    });

    expect(activities.verify).toHaveBeenCalledWith({ sessionId: "sess-1", stepNumber: 2 });
    expect(activities.recordStepCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "sess-1", stepNumber: 2 }),
    );
    expect(activities.teardown).toHaveBeenCalledTimes(1);
  }, 120_000);

  it("a failing verification does not record a step completion", async () => {
    const activities = makeActivities(false);

    await runSession(activities, async (handle) => {
      await handle.signal(VERIFY_STEP_SIGNAL, 1);
    });

    expect(activities.verify).toHaveBeenCalled();
    expect(activities.recordStepCompletion).not.toHaveBeenCalled();
  }, 120_000);

  it("tears down even when persisting the provision output fails — no orphaned K8s job", async () => {
    const activities = makeActivities();
    activities.recordProvisioned.mockRejectedValue(new Error("db down"));

    await expect(runSession(activities)).rejects.toThrow();

    // provision succeeded, so infrastructure exists — teardown must still run
    expect(activities.provision).toHaveBeenCalled();
    expect(activities.teardown).toHaveBeenCalledWith({ sessionId: "sess-1" });
  }, 120_000);

  it("learner-active keeps the session alive until the window lapses again", async () => {
    const activities = makeActivities();

    await runSession(activities, async (handle) => {
      // Reset the inactivity window twice; the workflow must still tear down
      // once the signals stop.
      await handle.signal(LEARNER_ACTIVE_SIGNAL);
      await testEnv.sleep(10 * 60 * 1000);
      await handle.signal(LEARNER_ACTIVE_SIGNAL);
    });

    expect(activities.teardown).toHaveBeenCalledTimes(1);
  }, 120_000);
});
