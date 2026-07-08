import { Connection, Client } from "@temporalio/client";
import type { capstoneSessionWorkflow } from "@fluent/capstone-runner/src/workflows/capstone-session";

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
  await c.workflow.start("capstoneSessionWorkflow" as unknown as typeof capstoneSessionWorkflow, {
    taskQueue: "capstone-sessions",
    workflowId: `capstone-session-${sessionId}`,
    args: [{ sessionId }],
  });
}

export async function signalLearnerActive(sessionId: string): Promise<void> {
  try {
    const c = await getClient();
    const handle = c.workflow.getHandle(`capstone-session-${sessionId}`);
    await handle.signal("learner-active");
  } catch {
    // Workflow may not exist yet or may have completed — signal is best-effort
  }
}

export async function signalVerifyStep(sessionId: string, stepNumber: number): Promise<void> {
  try {
    const c = await getClient();
    const handle = c.workflow.getHandle(`capstone-session-${sessionId}`);
    await handle.signal("verify-step", stepNumber);
  } catch {
    // Workflow may not exist yet or may have completed — signal is best-effort
  }
}
