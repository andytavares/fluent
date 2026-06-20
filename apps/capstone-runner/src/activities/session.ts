import pino from "pino";

const logger = pino({ base: { service: "capstone-runner" } });

// Teardown activity — deletes the K8s Job when session ends or times out
export async function teardown({ sessionId }: { sessionId: string }) {
  const start = Date.now();
  try {
    const { KubeConfig, BatchV1Api } = await import("@kubernetes/client-node");
    const kc = new KubeConfig();
    kc.loadFromDefault();
    const batchApi = kc.makeApiClient(BatchV1Api);
    const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";
    const jobName = `capstone-${sessionId}`;

    await batchApi.deleteNamespacedJob({ name: jobName, namespace: NAMESPACE });

    logger.info({
      event: "teardown_complete",
      session_id: sessionId,
      duration_ms: Date.now() - start,
    });
  } catch (err) {
    logger.error({ event: "teardown_error", session_id: sessionId, err });
    throw err;
  }
}

// Record a completed step (called after verifier confirms pass)
export async function recordStepCompletion({
  sessionId,
  stepNumber,
  verificationResult,
}: {
  sessionId: string;
  stepNumber: number;
  verificationResult: { passed: boolean; http_tests: unknown[] };
}) {
  const start = Date.now();

  logger.info({
    event: "step_completion",
    session_id: sessionId,
    step: stepNumber,
    duration_ms: Date.now() - start,
  });

  return { sessionId, stepNumber, verificationResult };
}
