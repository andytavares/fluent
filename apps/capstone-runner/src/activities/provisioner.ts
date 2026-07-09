import * as k8s from "@kubernetes/client-node";
import { capstoneJobName } from "@fluent/capstone-contract";
import { createCipheriv, randomBytes } from "node:crypto";
import pino from "pino";

if (!process.env["CAPSTONE_ENCRYPTION_KEY"]) {
  throw new Error("CAPSTONE_ENCRYPTION_KEY is required");
}

const logger = pino({ base: { service: "capstone-runner" } });

const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";
const DB_IMAGE = process.env["POSTGRES_SIDECAR_IMAGE"] ?? "postgres:16-alpine";
const APP_IMAGE = process.env["CAPSTONE_APP_IMAGE"] ?? "golang:1.21-alpine";

// Polls /code/.deployed for mtime changes and (re)starts `go run main.go` on
// each change, capturing combined stdout+stderr to /code/out.log (truncated
// on each restart so stale errors don't linger). The deploy HTTP endpoint
// (a parallel workstream) writes /code/main.go then touches /code/.deployed
// to trigger a restart.
//
// Learner server contract: the learner's Go server MUST listen on port 8080
// (fixed, no configurability for v1) and read DATABASE_URL from its
// environment to connect to Postgres.
const APP_RUN_LOOP_SCRIPT = `
apk add --no-cache curl >/dev/null 2>&1
mkdir -p /code
cat > /code/go.mod <<'EOF'
module solution

go 1.21
EOF
touch /code/main.go /code/.deployed
LAST=0
PID=
while true; do
  MTIME=$(stat -c %Y /code/.deployed 2>/dev/null || echo 0)
  if [ "$MTIME" != "$LAST" ]; then
    LAST="$MTIME"
    if [ -n "$PID" ]; then kill "$PID" 2>/dev/null; fi
    : > /code/out.log
    (cd /code && go run main.go >> /code/out.log 2>&1) &
    PID=$!
  fi
  sleep 1
done
`;

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

export async function provision({ sessionId }: { sessionId: string }) {
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
              image: APP_IMAGE,
              env: [{ name: "DATABASE_URL", value: `postgresql://postgres:${dbPassword}@localhost:5432/capstone` }],
              command: ["sh", "-c", APP_RUN_LOOP_SCRIPT],
            },
          ],
        },
      },
    },
  };

  await batchApi.createNamespacedJob(NAMESPACE, job);

  const connString = `postgresql://postgres:${dbPassword}@${jobName}:5432/capstone`;
  const encryptedConn = encryptConnString(connString);

  logger.info({ event: "provision_complete", sessionId, jobName });

  return { jobName, encryptedConn };
}
