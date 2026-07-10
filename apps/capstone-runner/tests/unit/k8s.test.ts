import { describe, it, expect, vi, beforeEach } from "vitest";

const listNamespacedPod = vi.fn();
const execMock = vi.fn();

vi.mock("@kubernetes/client-node", () => {
  class KubeConfig {
    loadFromDefault() {}
    makeApiClient() {
      return { listNamespacedPod };
    }
  }
  class Exec {
    exec = execMock;
  }
  return { KubeConfig, Exec, CoreV1Api: class CoreV1Api {} };
});

const { findSessionPod, execInPod, PodNotFoundError } = await import("../../src/k8s.js");

describe("findSessionPod", () => {
  beforeEach(() => {
    listNamespacedPod.mockReset();
  });

  it("returns the running pod's name, filtered by the sessionId label", async () => {
    listNamespacedPod.mockResolvedValue({
      body: { items: [{ status: { phase: "Pending" }, metadata: { name: "old" } }, { status: { phase: "Running" }, metadata: { name: "capstone-abc-xyz12" } }] },
    });

    const name = await findSessionPod("abc");

    expect(name).toBe("capstone-abc-xyz12");
    expect(listNamespacedPod).toHaveBeenCalledWith(
      "capstone-sessions",
      undefined,
      undefined,
      undefined,
      undefined,
      "sessionId=abc",
    );
  });

  it("throws PodNotFoundError when no pod is Running", async () => {
    listNamespacedPod.mockResolvedValue({ body: { items: [{ status: { phase: "Pending" }, metadata: { name: "old" } } ] } });

    await expect(findSessionPod("abc")).rejects.toThrow(PodNotFoundError);
  });

  it("throws PodNotFoundError when there are no pods at all", async () => {
    listNamespacedPod.mockResolvedValue({ body: { items: [] } });

    await expect(findSessionPod("abc")).rejects.toThrow(PodNotFoundError);
  });
});

describe("execInPod", () => {
  beforeEach(() => {
    execMock.mockReset();
  });

  function mockExecWith(status: unknown, stdoutData?: string, stderrData?: string) {
    execMock.mockImplementation(async (_ns, _pod, _container, _cmd, stdout, stderr, _stdin, _tty, statusCallback) => {
      if (stdoutData) stdout.write(stdoutData);
      if (stderrData) stderr.write(stderrData);
      // Simulate the K8s exec sub-protocol delivering the status asynchronously.
      queueMicrotask(() => statusCallback(status));
      return {};
    });
  }

  it("resolves with captured stdout/stderr and exitCode 0 on success", async () => {
    mockExecWith({ status: "Success" }, "hello\n");

    const result = await execInPod("pod-1", "app", ["echo", "hello"]);

    expect(result).toEqual({ stdout: "hello\n", stderr: "", exitCode: 0 });
  });

  it("parses the ExitCode cause on a non-zero exit", async () => {
    mockExecWith(
      { status: "Failure", reason: "NonZeroExitCode", details: { causes: [{ reason: "ExitCode", message: "17" }] } },
      "",
      "boom\n",
    );

    const result = await execInPod("pod-1", "app", ["false"]);

    expect(result).toEqual({ stdout: "", stderr: "boom\n", exitCode: 17 });
  });

  it("defaults to exitCode 1 when a failure has no parseable ExitCode cause", async () => {
    mockExecWith({ status: "Failure", reason: "Internal" });

    const result = await execInPod("pod-1", "app", ["false"]);

    expect(result.exitCode).toBe(1);
  });

  it("always passes null stdin (the exec protocol can't half-close stdin — see k8s.ts)", async () => {
    let capturedStdin: unknown = "unset";
    execMock.mockImplementation(async (_ns, _pod, _container, _cmd, _stdout, _stderr, stdin, _tty, statusCallback) => {
      capturedStdin = stdin;
      queueMicrotask(() => statusCallback({ status: "Success" }));
      return {};
    });

    await execInPod("pod-1", "app", ["true"]);

    expect(capturedStdin).toBeNull();
  });

  it("rejects instead of hanging when the socket closes before the status frame arrives", async () => {
    execMock.mockImplementation(async () => {
      const conn: { onclose?: () => void } = {};
      // Simulate the socket dying after connect but before any status.
      // (Macrotask, so execInPod's .then has attached onclose by then.)
      setTimeout(() => conn.onclose?.(), 0);
      return conn;
    });

    await expect(execInPod("pod-1", "app", ["true"])).rejects.toThrow(
      /exec socket closed before command completion/,
    );
  });
});
