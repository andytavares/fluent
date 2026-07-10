import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const findSessionPod = vi.fn();
const execInPod = vi.fn();

vi.mock("../../src/k8s.js", () => ({ findSessionPod, execInPod }));

const { verify, verifyScriptPath, fixturesPath, parseHttpTestOutput } = await import("../../src/activities/verifier.js");

// Tests the shipping verify() activity: it finds the learner's pod, loads
// fixtures (best-effort) into the postgres container, execs the step's
// verify.sh content inside the app container (same network namespace as the
// learner's server), and parses the script's JSON-lines output.

let contentRoot: string;

async function writeStepFile(stepNumber: number, filename: string, body: string): Promise<void> {
  const dir = join(contentRoot, "content/capstone/go-crud-api", `step-${stepNumber}`);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), body);
}

beforeAll(async () => {
  contentRoot = await mkdtemp(join(tmpdir(), "fluent-verify-"));
});

afterAll(async () => {
  await rm(contentRoot, { recursive: true, force: true });
});

beforeEach(() => {
  findSessionPod.mockReset();
  execInPod.mockReset();
  findSessionPod.mockResolvedValue("pod-1");
});

describe("verifyScriptPath", () => {
  it("resolves the step's verify.sh inside the capstone content tree", () => {
    expect(verifyScriptPath(4, "/repo")).toBe("/repo/content/capstone/go-crud-api/step-4/verify.sh");
  });
});

describe("fixturesPath", () => {
  it("resolves the step's fixtures.sql inside the capstone content tree", () => {
    expect(fixturesPath(4, "/repo")).toBe("/repo/content/capstone/go-crud-api/step-4/fixtures.sql");
  });
});

describe("parseHttpTestOutput", () => {
  it("parses one JSON object per line", () => {
    const out = parseHttpTestOutput(
      '{"method":"GET","path":"/health","status":200,"passed":true}\n{"method":"POST","path":"/users","status":201,"passed":true}',
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ method: "GET", path: "/health", status: 200, passed: true });
  });

  it("treats invalid JSON lines as failed UNKNOWN tests", () => {
    const out = parseHttpTestOutput("not json");
    expect(out).toEqual([{ method: "UNKNOWN", path: "/", status: 0, passed: false }]);
  });

  it("returns an empty array for empty output", () => {
    expect(parseHttpTestOutput("")).toEqual([]);
  });
});

describe("verify activity", () => {
  it("passes when every HTTP test line passes", async () => {
    await writeStepFile(1, "verify.sh", "echo test");
    execInPod.mockResolvedValue({
      stdout: '{"method":"GET","path":"/health","status":200,"passed":true}\n{"method":"POST","path":"/users","status":201,"passed":true}',
      stderr: "",
      exitCode: 0,
    });

    const result = await verify({ sessionId: "s1", stepNumber: 1 }, contentRoot);

    expect(result.passed).toBe(true);
    expect(result.http_tests).toHaveLength(2);
  });

  it("fails when any HTTP test fails", async () => {
    await writeStepFile(2, "verify.sh", "echo test");
    execInPod.mockResolvedValue({
      stdout: '{"method":"GET","path":"/health","status":200,"passed":true}\n{"method":"POST","path":"/users","status":500,"passed":false}',
      stderr: "",
      exitCode: 0,
    });

    const result = await verify({ sessionId: "s1", stepNumber: 2 }, contentRoot);

    expect(result.passed).toBe(false);
  });

  it("treats invalid JSON lines as failed tests", async () => {
    await writeStepFile(3, "verify.sh", "echo test");
    execInPod.mockResolvedValue({ stdout: "not json", stderr: "", exitCode: 0 });

    const result = await verify({ sessionId: "s1", stepNumber: 3 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests[0]?.method).toBe("UNKNOWN");
  });

  it("treats empty output as failure (nothing ran means nothing verified)", async () => {
    await writeStepFile(4, "verify.sh", "echo test");
    execInPod.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });

    const result = await verify({ sessionId: "s1", stepNumber: 4 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("fails safe when the step has no verify script", async () => {
    const result = await verify({ sessionId: "s1", stepNumber: 99 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
    expect(execInPod).not.toHaveBeenCalled();
  });

  it("fails safe when no pod is found for the session", async () => {
    await writeStepFile(6, "verify.sh", "echo test");
    findSessionPod.mockRejectedValue(new Error("no pod"));

    const result = await verify({ sessionId: "s1", stepNumber: 6 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("loads fixtures into the postgres container before running verify.sh", async () => {
    await writeStepFile(7, "verify.sh", "echo test");
    await writeStepFile(7, "fixtures.sql", "insert into users values (1);");
    execInPod.mockResolvedValue({ stdout: '{"method":"GET","path":"/x","status":200,"passed":true}', stderr: "", exitCode: 0 });

    await verify({ sessionId: "s1", stepNumber: 7 }, contentRoot);

    expect(execInPod).toHaveBeenCalledTimes(2);
    const [fixturesCall, verifyCall] = execInPod.mock.calls;
    expect(fixturesCall[0]).toBe("pod-1");
    expect(fixturesCall[1]).toBe("postgres");
    expect(fixturesCall[2]).toEqual([
      "sh",
      "-c",
      'PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d capstone -v ON_ERROR_STOP=0 -c "$1"',
      "sh",
      "insert into users values (1);",
    ]);

    expect(verifyCall[0]).toBe("pod-1");
    expect(verifyCall[1]).toBe("app");
  });

  it("does not abort verification when fixtures loading throws", async () => {
    await writeStepFile(8, "verify.sh", "echo test");
    await writeStepFile(8, "fixtures.sql", "insert into users values (1);");
    execInPod
      .mockRejectedValueOnce(new Error("psql failed"))
      .mockResolvedValueOnce({ stdout: '{"method":"GET","path":"/x","status":200,"passed":true}', stderr: "", exitCode: 0 });

    const result = await verify({ sessionId: "s1", stepNumber: 8 }, contentRoot);

    expect(result.passed).toBe(true);
  });

  it("skips fixtures loading (but still verifies) when the step has no fixtures.sql", async () => {
    await writeStepFile(9, "verify.sh", "echo test");
    execInPod.mockResolvedValue({ stdout: '{"method":"GET","path":"/x","status":200,"passed":true}', stderr: "", exitCode: 0 });

    await verify({ sessionId: "s1", stepNumber: 9 }, contentRoot);

    expect(execInPod).toHaveBeenCalledTimes(1);
    expect(execInPod.mock.calls[0]?.[1]).toBe("app");
  });

  it("execs verify.sh in the app container using positional parameters, not string interpolation", async () => {
    await writeStepFile(10, "verify.sh", "echo test");
    execInPod.mockResolvedValue({ stdout: '{"method":"GET","path":"/x","status":200,"passed":true}', stderr: "", exitCode: 0 });

    await verify({ sessionId: "sess-9; rm -rf /", stepNumber: 10 }, contentRoot);

    const verifyCall = execInPod.mock.calls[execInPod.mock.calls.length - 1];
    expect(verifyCall[0]).toBe("pod-1");
    expect(verifyCall[1]).toBe("app");
    expect(verifyCall[2]).toEqual([
      "sh",
      "-c",
      'printf \'%s\' "$1" > /tmp/verify.sh && SESSION_ID="$2" STEP_NUMBER="$3" bash /tmp/verify.sh',
      "sh",
      "echo test",
      "sess-9; rm -rf /",
      "10",
    ]);
  });

  it("runs the real repo's step-1 verify script path by default", () => {
    expect(verifyScriptPath(1)).toContain("content/capstone/go-crud-api/step-1/verify.sh");
  });
});
