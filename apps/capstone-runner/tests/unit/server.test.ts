import { describe, it, expect, vi, beforeEach } from "vitest";

const findSessionPod = vi.fn();
const execInPod = vi.fn();

vi.mock("../../src/k8s.js", async () => {
  const actual = await vi.importActual<typeof import("../../src/k8s.js")>("../../src/k8s.js");
  return { ...actual, findSessionPod, execInPod };
});

const { buildServer, parseQueryOutput } = await import("../../src/server.js");
const { PodNotFoundError } = await import("../../src/k8s.js");

// Tests the internal Fastify server that drives the learner's app container
// (deploy) and queries their postgres container (query). Both routes go
// through findSessionPod/execInPod, mocked here the same way verifier.test.ts
// and k8s.test.ts mock them.

beforeEach(() => {
  findSessionPod.mockReset();
  execInPod.mockReset();
});

describe("POST /sessions/:sessionId/deploy", () => {
  it("writes code, waits, and returns the tail of out.log on success", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod
      .mockResolvedValueOnce({ stdout: "", stderr: "", exitCode: 0 }) // write+restart
      .mockResolvedValueOnce({ stdout: "server listening on :8080\n", stderr: "", exitCode: 0 }); // cat out.log

    const app = buildServer();
    const res = await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "package main", language: "go" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ compileLog: "server listening on :8080\n" });

    expect(findSessionPod).toHaveBeenCalledWith("s1");
    expect(execInPod).toHaveBeenNthCalledWith(1, "pod-1", "app", [
      "sh",
      "-c",
      'mkdir -p "$(dirname /code/main.go)" && printf \'%s\' "$1" > /code/main.go && touch /code/.deployed',
      "sh",
      "package main",
    ]);
    expect(execInPod).toHaveBeenNthCalledWith(2, "pod-1", "app", ["cat", "/code/out.log"]);
  }, 10000);

  it("writes to the language-specific entrypoint path (including nested directories)", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod
      .mockResolvedValueOnce({ stdout: "", stderr: "", exitCode: 0 })
      .mockResolvedValueOnce({ stdout: "", stderr: "", exitCode: 0 });

    const app = buildServer();
    await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "fn main() {}", language: "rust" },
    });

    expect(execInPod).toHaveBeenNthCalledWith(1, "pod-1", "app", [
      "sh",
      "-c",
      'mkdir -p "$(dirname /code/src/main.rs)" && printf \'%s\' "$1" > /code/src/main.rs && touch /code/.deployed',
      "sh",
      "fn main() {}",
    ]);
  });

  it("replies 400 for an unsupported language", async () => {
    const app = buildServer();
    const res = await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "x", language: "cobol" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'unsupported language "cobol"' });
    expect(findSessionPod).not.toHaveBeenCalled();
  });

  it("replies 404 when the session pod isn't found", async () => {
    findSessionPod.mockRejectedValue(new PodNotFoundError("s1"));

    const app = buildServer();
    const res = await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "x", language: "go" },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "session pod not found" });
    expect(execInPod).not.toHaveBeenCalled();
  });

  it("replies 500 when the write-and-restart exec fails (non-zero exit)", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockResolvedValueOnce({ stdout: "", stderr: "no such file", exitCode: 1 });

    const app = buildServer();
    const res = await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "x", language: "go" },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "no such file" });
    expect(execInPod).toHaveBeenCalledTimes(1); // never got to cat out.log
  });

  it("replies 500 when the write-and-restart exec throws", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockRejectedValueOnce(new Error("websocket closed"));

    const app = buildServer();
    const res = await app.inject({
      method: "POST",
      url: "/sessions/s1/deploy",
      payload: { code: "x", language: "go" },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "websocket closed" });
  });
});

describe("POST /sessions/:sessionId/query", () => {
  it("parses a CSV row set into columns/rows", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockResolvedValue({ stdout: "id,name\n1,alice\n2,bob\n", stderr: "", exitCode: 0 });

    const app = buildServer();
    const res = await app.inject({ method: "POST", url: "/sessions/s1/query", payload: { sql: "SELECT * FROM users" } });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      kind: "rows",
      columns: ["id", "name"],
      rows: [
        ["1", "alice"],
        ["2", "bob"],
      ],
    });
  });

  it("parses a command-completion tag into a message result", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockResolvedValue({ stdout: "INSERT 0 1\n", stderr: "", exitCode: 0 });

    const app = buildServer();
    const res = await app.inject({ method: "POST", url: "/sessions/s1/query", payload: { sql: "INSERT INTO users DEFAULT VALUES" } });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ kind: "message", message: "INSERT 0 1" });
  });

  it("replies 404 when the session pod isn't found", async () => {
    findSessionPod.mockRejectedValue(new PodNotFoundError("s1"));

    const app = buildServer();
    const res = await app.inject({ method: "POST", url: "/sessions/s1/query", payload: { sql: "SELECT 1" } });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "session pod not found" });
  });

  it("replies 500 when psql exits non-zero", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockResolvedValue({ stdout: "", stderr: "ERROR: syntax error", exitCode: 1 });

    const app = buildServer();
    const res = await app.inject({ method: "POST", url: "/sessions/s1/query", payload: { sql: "GARBAGE" } });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "ERROR: syntax error" });
  });

  it("passes the SQL as a positional argv element ($1), never interpolated into the shell script string", async () => {
    findSessionPod.mockResolvedValue("pod-1");
    execInPod.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });

    const maliciousSql = "SELECT 1; '; DROP TABLE users; --";

    const app = buildServer();
    await app.inject({ method: "POST", url: "/sessions/s1/query", payload: { sql: maliciousSql } });

    expect(execInPod).toHaveBeenCalledOnce();
    const [, containerName, command] = execInPod.mock.calls[0] as [string, string, string[]];
    expect(containerName).toBe("postgres");

    // The command array must have exactly 5 elements: sh, -c, <fixed script>, sh, <sql>.
    // The SQL must be its OWN argv element (command[4]), and the fixed script
    // string (command[2]) must NOT contain the SQL text anywhere within it —
    // that's the property that prevents shell-metacharacter injection.
    expect(command).toHaveLength(5);
    expect(command[0]).toBe("sh");
    expect(command[1]).toBe("-c");
    expect(command[2]).not.toContain(maliciousSql);
    expect(command[2]).toContain("$1");
    expect(command[3]).toBe("sh");
    expect(command[4]).toBe(maliciousSql);
  });
});

describe("parseQueryOutput", () => {
  it("treats empty output as a generic OK message", () => {
    expect(parseQueryOutput("")).toEqual({ kind: "message", message: "OK" });
  });

  it("recognizes completion tags case-insensitively", () => {
    expect(parseQueryOutput("update 3\n")).toEqual({ kind: "message", message: "update 3" });
  });
});
