import * as k8s from "@kubernetes/client-node";
import { PassThrough } from "node:stream";

// Everything the capstone-runner needs from a learner's pod — deploying
// code, verifying a step, and running a SQL query — goes through this one
// primitive (Exec) instead of a K8s Service/Ingress/port-forward. Exec runs
// a command inside a specific container over a WebSocket; because it runs
// *inside* the pod's own network namespace, "localhost" always resolves to
// sibling containers in the same pod with no extra networking to provision.

export const NAMESPACE = process.env["K8S_NAMESPACE"] ?? "capstone-sessions";

export class PodNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`No running pod found for capstone session ${sessionId}`);
  }
}

function kubeConfig(): k8s.KubeConfig {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  return kc;
}

/** Finds the running pod for a session (Jobs generate random pod-name suffixes, so we look up by label). */
export async function findSessionPod(sessionId: string): Promise<string> {
  const coreApi = kubeConfig().makeApiClient(k8s.CoreV1Api);
  const res = await coreApi.listNamespacedPod(
    NAMESPACE,
    undefined,
    undefined,
    undefined,
    undefined,
    `sessionId=${sessionId}`,
  );
  const running = res.body.items.find((pod) => pod.status?.phase === "Running");
  if (!running?.metadata?.name) {
    throw new PodNotFoundError(sessionId);
  }
  return running.metadata.name;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Runs a command inside a container of the given pod and resolves once the
 * command completes (not once the WebSocket opens, which is what Exec.exec's
 * own promise resolves on — completion arrives later via the status
 * callback, per the Kubernetes exec sub-protocol).
 *
 * Deliberately does NOT support stdin: this client library's exec protocol
 * (v4.channel.k8s.io) has no way to half-close just the stdin channel, so
 * its stdin end-handler closes the ENTIRE WebSocket — the status frame never
 * arrives and the returned promise hangs forever. Callers that need to feed
 * content into a command must pass it as a positional `sh -c '... "$1"' sh
 * <content>` argv element instead (which also avoids shell interpolation of
 * untrusted content — see the SQL query route).
 */
export async function execInPod(
  podName: string,
  containerName: string,
  command: string[],
): Promise<ExecResult> {
  const exec = new k8s.Exec(kubeConfig());
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
  stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

  return new Promise<ExecResult>((resolve, reject) => {
    let settled = false;
    exec
      .exec(NAMESPACE, podName, containerName, command, stdout, stderr, null, false, (status) => {
        settled = true;
        const exitCause = status.details?.causes?.find((c) => c.reason === "ExitCode");
        const exitCode = status.status === "Success" ? 0 : parseInt(exitCause?.message ?? "1", 10);
        resolve({ stdout: Buffer.concat(stdoutChunks).toString("utf8"), stderr: Buffer.concat(stderrChunks).toString("utf8"), exitCode });
      })
      .then((conn) => {
        // Fail loud instead of hanging if the socket dies before the status
        // frame arrives (network blip, pod killed mid-exec, etc.).
        conn.onclose = () => {
          if (!settled) {
            settled = true;
            reject(new Error(`exec socket closed before command completion (pod ${podName}, container ${containerName})`));
          }
        };
      })
      .catch(reject);
  });
}
