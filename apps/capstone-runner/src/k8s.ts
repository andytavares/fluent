import * as k8s from "@kubernetes/client-node";
import { PassThrough } from "node:stream";
import type { Readable } from "node:stream";

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
 */
export async function execInPod(
  podName: string,
  containerName: string,
  command: string[],
  opts: { stdin?: string | Readable } = {},
): Promise<ExecResult> {
  const exec = new k8s.Exec(kubeConfig());
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
  stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

  const stdin =
    typeof opts.stdin === "string"
      ? (() => {
          const s = new PassThrough();
          s.end(opts.stdin);
          return s;
        })()
      : (opts.stdin ?? null);

  return new Promise<ExecResult>((resolve, reject) => {
    exec
      .exec(NAMESPACE, podName, containerName, command, stdout, stderr, stdin, false, (status) => {
        const exitCause = status.details?.causes?.find((c) => c.reason === "ExitCode");
        const exitCode = status.status === "Success" ? 0 : parseInt(exitCause?.message ?? "1", 10);
        resolve({ stdout: Buffer.concat(stdoutChunks).toString("utf8"), stderr: Buffer.concat(stderrChunks).toString("utf8"), exitCode });
      })
      .catch(reject);
  });
}
