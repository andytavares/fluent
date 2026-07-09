import { describe, it, expect } from "vitest";
import { runCode } from "../../src/executor/polyglot-runner.js";

// The executor's interface is run(code, language, testFile?) → ExecutionResult.
// These tests exercise the host-native runners (no Docker required).

describe("polyglot-runner: javascript", () => {
  it("runs code and captures stdout with exit 0", async () => {
    const result = await runCode("console.log('hi')", "javascript");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hi");
    expect(result.timedOut).toBe(false);
  });

  it("propagates a non-zero exit code", async () => {
    const result = await runCode("process.exit(3)", "javascript");
    expect(result.exitCode).toBe(3);
  });

  it("captures stderr on failure", async () => {
    const result = await runCode("throw new Error('boom')", "javascript");
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("boom");
  });

  it("runs a test suite against the stub", async () => {
    const stub = "exports.add = (a, b) => a + b;";
    const testFile = [
      "const { add } = require('./stub.js');",
      "if (add(1, 2) !== 3) process.exit(1);",
      "console.log('suite ok');",
    ].join("\n");

    const result = await runCode(stub, "javascript", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("suite ok");
  });

  it("fails the suite when the stub is wrong", async () => {
    const stub = "exports.add = (a, b) => a - b;";
    const testFile = [
      "const { add } = require('./stub.js');",
      "if (add(1, 2) !== 3) process.exit(1);",
    ].join("\n");

    const result = await runCode(stub, "javascript", testFile);
    expect(result.exitCode).toBe(1);
  });

  it("extracts trace frames and strips them from stdout", async () => {
    const result = await runCode(
      "trace.step({ label: 'frame-1' });\nconsole.log('visible')",
      "javascript",
    );
    expect(result.exitCode).toBe(0);
    expect(result.trace).toEqual([{ label: "frame-1" }]);
    expect(result.stdout).toContain("visible");
    expect(result.stdout).not.toContain("__TRACE__");
  });
});

describe("polyglot-runner: python", () => {
  it("runs code and captures stdout", async () => {
    const result = await runCode("print('py ok')", "python");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("py ok");
  });

  it("runs a test suite importing the stub module", async () => {
    const stub = "def add(a, b):\n    return a + b\n";
    const testFile = "from stub import add\nassert add(1, 2) == 3\nprint('py suite ok')\n";

    const result = await runCode(stub, "python", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("py suite ok");
  });

  it("fails the suite on a broken stub", async () => {
    const stub = "def add(a, b):\n    return a - b\n";
    const testFile = "from stub import add\nassert add(1, 2) == 3\n";

    const result = await runCode(stub, "python", testFile);
    expect(result.exitCode).not.toBe(0);
  });
});

describe("polyglot-runner: shell", () => {
  it("runs a script", async () => {
    const result = await runCode("echo shell-ok", "shell");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("shell-ok");
  });
});

describe("polyglot-runner: unsupported language", () => {
  it("returns exit 1 with an explanatory error, without throwing", async () => {
    const result = await runCode("whatever", "cobol");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("not supported");
  });
});
