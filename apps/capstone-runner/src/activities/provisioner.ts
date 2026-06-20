import * as k8s from "@kubernetes/client-node";
import { createCipheriv, randomBytes } from "node:crypto";
import pino from "pino";

const logger = pino({ base: { service: "capstone-runner" } });

const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";
const DB_IMAGE = process.env["POSTGRES_SIDECAR_IMAGE"] ?? "postgres:16-alpine";

function encryptConnString(plaintext: string): string {
  const keyHex = process.env["CAPSTONE_ENCRYPTION_KEY"] ?? "0".repeat(64);
  const key = Buffer.from(keyHex, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Encode as iv:authTag:ciphertext (all hex) so we can decrypt later
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function provision({ sessionId }: { sessionId: string }) {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const batchApi = kc.makeApiClient(k8s.BatchV1Api);

  const jobName = `capstone-${sessionId}`;
  const dbPassword = randomBytes(16).toString("hex");

  const job: k8s.V1Job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: { name: jobName, namespace: NAMESPACE, labels: { sessionId } },
    spec: {
      ttlSecondsAfterFinished: 600,
      template: {
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
          ],
        },
      },
    },
  };

  await batchApi.createNamespacedJob({ namespace: NAMESPACE, body: job });

  const connString = `postgresql://postgres:${dbPassword}@${jobName}:5432/capstone`;
  const encryptedConn = encryptConnString(connString);

  logger.info({ event: "provision_complete", sessionId, jobName });

  return { jobName, encryptedConn };
}
