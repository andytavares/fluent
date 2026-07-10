import * as k8s from "@kubernetes/client-node";
import { capstoneJobName } from "@fluent/capstone-contract";
import { createCipheriv, randomBytes } from "node:crypto";
import pino from "pino";
import { findSessionPod, execInPod, PodNotFoundError } from "../k8s.js";
import { LANGUAGE_RUNTIMES, composeAppCommand } from "../language-runtimes.js";

if (!process.env["CAPSTONE_ENCRYPTION_KEY"]) {
  throw new Error("CAPSTONE_ENCRYPTION_KEY is required");
}

const logger = pino({ base: { service: "capstone-runner" } });

const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";
const DB_IMAGE = process.env["POSTGRES_SIDECAR_IMAGE"] ?? "postgres:16-alpine";

function encryptConnString(plaintext: string): string {
  const keyHex = process.env["CAPSTONE_ENCRYPTION_KEY"]!;
  const key = Buffer.from(keyHex, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Encode as iv:authTag:ciphertext (all hex) so we can decrypt later
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function provision({ sessionId, trackSlug }: { sessionId: string; trackSlug: string }) {
  const runtime = LANGUAGE_RUNTIMES[trackSlug];
  if (!runtime) {
    throw new Error(`No LanguageRuntime configured for track "${trackSlug}"`);
  }

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);
  const batchApi = kc.makeApiClient(k8s.BatchV1Api);

  // Create the namespace if it doesn't exist
  try {
    await coreApi.readNamespace(NAMESPACE);
  } catch {
    await coreApi.createNamespace({ apiVersion: "v1", kind: "Namespace", metadata: { name: NAMESPACE } });
    logger.info({ event: "namespace_created", namespace: NAMESPACE });
  }

  const jobName = capstoneJobName(sessionId);
  const dbPassword = randomBytes(16).toString("hex");

  const job: k8s.V1Job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: { name: jobName, namespace: NAMESPACE, labels: { sessionId } },
    spec: {
      ttlSecondsAfterFinished: 600,
      template: {
        metadata: { labels: { sessionId } },
        spec: {
          restartPolicy: "Never",
          containers: [
            {
              name: "postgres",
              image: DB_IMAGE,
              env: [
                { name: "POSTGRES_PASSWORD", value: dbPassword },
                { name: "POSTGRES_DB", value: "capstone" },
              ],
              ports: [{ containerPort: 5432 }],
            },
            {
              name: "app",
              image: runtime.image,
              env: [{ name: "DATABASE_URL", value: `postgresql://postgres:${dbPassword}@localhost:5432/capstone` }],
              command: ["sh", "-c", composeAppCommand(runtime)],
            },
          ],
        },
      },
    },
  };

  await batchApi.createNamespacedJob(NAMESPACE, job);
  await waitForAppReady(sessionId);

  const connString = `postgresql://postgres:${dbPassword}@${jobName}:5432/capstone`;
  const encryptedConn = encryptConnString(connString);

  logger.info({ event: "provision_complete", sessionId, jobName });

  return { jobName, encryptedConn };
}

const READY_POLL_INTERVAL_MS = 2000;
const READY_TIMEOUT_MS = 4 * 60 * 1000; // pulling the image + one-time dependency setup can take a while on a cold cache

/**
 * The Job being created does not mean the pod is Running yet, and a Running
 * pod doesn't mean the app container's one-time setupScript has finished
 * — deploy/query would 404 (no pod) or silently fail (no driver yet) if
 * callers treated "provisioned" as "immediately usable". This blocks
 * provision() from returning until /code/setup-done actually exists (each
 * language's setupScript touches it right after its one-time Postgres client
 * setup completes), so by the time the session row records
 * dbConnectionEncrypted — which the UI reads as "connected" — the
 * environment genuinely is.
 */
async function waitForAppReady(sessionId: string): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const podName = await findSessionPod(sessionId);
      const result = await execInPod(podName, "app", ["test", "-f", "/code/setup-done"]);
      if (result.exitCode === 0) return;
    } catch (err) {
      if (!(err instanceof PodNotFoundError)) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_INTERVAL_MS));
  }
  throw new Error(`Session ${sessionId}'s app container did not become ready within ${READY_TIMEOUT_MS}ms`);
}
