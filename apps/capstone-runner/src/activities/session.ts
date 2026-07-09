import { PrismaClient, Prisma } from "@prisma/client";
import { CAPSTONE_INACTIVITY_TIMEOUT_MS } from "@fluent/capstone-contract";
import pino from "pino";

const logger = pino({ base: { service: "capstone-runner" } });
const prisma = new PrismaClient();

type SessionDb = Pick<PrismaClient, "capstoneSessions" | "capstoneStepCompletion">;

// Internal seams (…With variants take the db) — the exported activities bind
// the process-wide client; tests exercise the same logic with a mock.

export async function recordProvisionedWith(
  db: SessionDb,
  {
    sessionId,
    jobName,
    encryptedConn,
  }: { sessionId: string; jobName: string; encryptedConn: string },
) {
  const now = new Date();
  await db.capstoneSessions.update({
    where: { id: sessionId },
    data: {
      k8sJobName: jobName,
      dbConnectionEncrypted: encryptedConn,
      dbProvisionedAt: now,
      dbExpiresAt: new Date(now.getTime() + CAPSTONE_INACTIVITY_TIMEOUT_MS),
    },
  });
  logger.info({ event: "provision_recorded", session_id: sessionId, job_name: jobName });
}

export async function recordStepCompletionWith(
  db: SessionDb,
  {
    sessionId,
    stepNumber,
    verificationResult,
  }: {
    sessionId: string;
    stepNumber: number;
    verificationResult: { passed: boolean; http_tests: unknown[] };
  },
) {
  const start = Date.now();

  const resultJson = verificationResult as unknown as Prisma.InputJsonValue;
  await db.capstoneStepCompletion.upsert({
    where: { sessionId_stepNumber: { sessionId, stepNumber } },
    update: { verificationResult: resultJson, completedAt: new Date() },
    create: { sessionId, stepNumber, verificationResult: resultJson },
  });

  // Advance the session pointer — but never backwards (re-verifying an
  // earlier step must not regress progress).
  await db.capstoneSessions.updateMany({
    where: { id: sessionId, currentStep: { lte: stepNumber } },
    data: { currentStep: stepNumber + 1, lastActiveAt: new Date() },
  });

  logger.info({
    event: "step_completion",
    session_id: sessionId,
    step: stepNumber,
    duration_ms: Date.now() - start,
  });

  return { sessionId, stepNumber, verificationResult };
}

export async function markSessionCompletedWith(db: SessionDb, sessionId: string) {
  // updateMany: idempotent, and tolerant of a row already completed or
  // deleted (e.g. enrollment reset cascades while the workflow winds down).
  await db.capstoneSessions.updateMany({
    where: { id: sessionId, completedAt: null },
    data: { completedAt: new Date() },
  });
}

// ── Activities ────────────────────────────────────────────────────────────

export async function recordProvisioned(input: {
  sessionId: string;
  jobName: string;
  encryptedConn: string;
}) {
  return recordProvisionedWith(prisma, input);
}

export async function recordStepCompletion(input: {
  sessionId: string;
  stepNumber: number;
  verificationResult: { passed: boolean; http_tests: unknown[] };
}) {
  return recordStepCompletionWith(prisma, input);
}

// Teardown activity — closes the session row and deletes the K8s Job when
// the workflow ends (inactivity timeout or completion). The row is closed
// first (idempotently) so a session never resumes as active after its
// workflow has ended; a K8s deletion failure still throws so Temporal
// retries the pod cleanup.
export async function teardown({ sessionId }: { sessionId: string }) {
  const start = Date.now();
  await markSessionCompletedWith(prisma, sessionId);

  try {
    const { KubeConfig, BatchV1Api } = await import("@kubernetes/client-node");
    const kc = new KubeConfig();
    kc.loadFromDefault();
    const batchApi = kc.makeApiClient(BatchV1Api);
    const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";
    const jobName = `capstone-${sessionId}`;

    await batchApi.deleteNamespacedJob(jobName, NAMESPACE);

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
