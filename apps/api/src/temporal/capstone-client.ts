import { Connection, Client } from "@temporalio/client";
import {
  CAPSTONE_TASK_QUEUE,
  CAPSTONE_WORKFLOW_TYPE,
  LEARNER_ACTIVE_SIGNAL,
  VERIFY_STEP_SIGNAL,
  capstoneWorkflowId,
} from "@fluent/capstone-contract";
import type { CapstoneSessionWorkflow } from "@fluent/capstone-contract";

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (client) return client;
  const connection = await Connection.connect({
    address: process.env["TEMPORAL_ADDRESS"] ?? "localhost:7233",
  });
  client = new Client({ connection, namespace: "default" });
  return client;
}

export async function startCapstoneWorkflow(sessionId: string): Promise<void> {
  const c = await getClient();
  await c.workflow.start<CapstoneSessionWorkflow>(CAPSTONE_WORKFLOW_TYPE, {
    taskQueue: CAPSTONE_TASK_QUEUE,
    workflowId: capstoneWorkflowId(sessionId),
    args: [{ sessionId }],
  });
}

export async function signalLearnerActive(sessionId: string): Promise<void> {
  try {
    const c = await getClient();
    const handle = c.workflow.getHandle(capstoneWorkflowId(sessionId));
    await handle.signal(LEARNER_ACTIVE_SIGNAL);
  } catch {
    // Workflow may not exist yet or may have completed — signal is best-effort
  }
}

export async function signalVerifyStep(sessionId: string, stepNumber: number): Promise<void> {
  try {
    const c = await getClient();
    const handle = c.workflow.getHandle(capstoneWorkflowId(sessionId));
    await handle.signal(VERIFY_STEP_SIGNAL, stepNumber);
  } catch {
    // Workflow may not exist yet or may have completed — signal is best-effort
  }
}
