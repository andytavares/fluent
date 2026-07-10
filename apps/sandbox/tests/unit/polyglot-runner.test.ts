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

describe("polyglot-runner: kubernetes", () => {
  it("runs a suite against the stub (helm-style dirname convention)", async () => {
    const stub = "apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\n";
    const testFile = [
      "#!/usr/bin/env bash",
      'STUB="$(dirname "$0")/stub.yaml"',
      'grep -q "kind: Pod" "$STUB" || exit 1',
      'echo "k8s suite ok"',
    ].join("\n");

    const result = await runCode(stub, "kubernetes", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("k8s suite ok");
  });

  it("fails the suite when the stub doesn't match", async () => {
    const stub = "apiVersion: v1\nkind: Service\n";
    const testFile = [
      "#!/usr/bin/env bash",
      'STUB="$(dirname "$0")/stub.yaml"',
      'grep -q "kind: Pod" "$STUB" || exit 1',
    ].join("\n");

    const result = await runCode(stub, "kubernetes", testFile);
    expect(result.exitCode).toBe(1);
  });

  it("run-only mode echoes the file content back", async () => {
    const stub = "apiVersion: v1\nkind: Pod\n";
    const result = await runCode(stub, "kubernetes");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(stub);
  });
});

describe("polyglot-runner: kafka", () => {
  it("runs a suite against the stub (helm-style dirname convention)", async () => {
    const stub = "bootstrap.servers=localhost:9092\nacks=all\n";
    const testFile = [
      "#!/usr/bin/env bash",
      'STUB="$(dirname "$0")/stub.properties"',
      'grep -q "acks=all" "$STUB" || exit 1',
      'echo "kafka suite ok"',
    ].join("\n");

    const result = await runCode(stub, "kafka", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("kafka suite ok");
  });

  it("run-only mode echoes the file content back", async () => {
    const stub = "bootstrap.servers=localhost:9092\n";
    const result = await runCode(stub, "kafka");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(stub);
  });
});

describe("polyglot-runner: aws", () => {
  it("runs a suite against the stub (helm-style dirname convention)", async () => {
    const stub = "#!/usr/bin/env bash\naws s3 ls\n";
    const testFile = [
      "#!/usr/bin/env bash",
      'STUB="$(dirname "$0")/stub.sh"',
      'grep -q "aws s3 ls" "$STUB" || exit 1',
      'echo "aws suite ok"',
    ].join("\n");

    const result = await runCode(stub, "aws", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("aws suite ok");
  });

  it("run-only mode echoes the file content back", async () => {
    const stub = "#!/usr/bin/env bash\naws s3 ls\n";
    const result = await runCode(stub, "aws");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(stub);
  });
});

describe("polyglot-runner: terraform (unchanged after refactor)", () => {
  it("passes the stub filename as $1 and runs the suite", async () => {
    const stub = 'resource "aws_instance" "example" {\n  ami = "ami-123"\n}\n';
    const testFile = [
      "#!/usr/bin/env bash",
      'grep -q "aws_instance" "$1" || exit 1',
      'echo "tf suite ok"',
    ].join("\n");

    const result = await runCode(stub, "terraform", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("tf suite ok");
  });

  it("run-only mode echoes the file content back", async () => {
    const stub = 'resource "aws_instance" "example" {}\n';
    const result = await runCode(stub, "terraform");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(stub);
  });
});

describe("polyglot-runner: helm (unchanged after refactor)", () => {
  it("locates the stub via dirname and runs the suite", async () => {
    const stub = "apiVersion: v2\nname: my-chart\n";
    const testFile = [
      "#!/usr/bin/env bash",
      'STUB="$(dirname "$0")/stub.yaml"',
      'grep -q "my-chart" "$STUB" || exit 1',
      'echo "helm suite ok"',
    ].join("\n");

    const result = await runCode(stub, "helm", testFile);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("helm suite ok");
  });

  it("run-only mode echoes the file content back", async () => {
    const stub = "apiVersion: v2\nname: my-chart\n";
    const result = await runCode(stub, "helm");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(stub);
  });
});

describe("polyglot-runner: unsupported language", () => {
  it("returns exit 1 with an explanatory error, without throwing", async () => {
    const result = await runCode("whatever", "cobol");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("not supported");
  });

  it("treats Object.prototype key names as unsupported, not artifact languages", async () => {
    // `language` is a client-supplied string; a plain-object `in` check would
    // have matched "constructor"/"toString" and crashed on the destructure.
    for (const hostile of ["constructor", "toString", "hasOwnProperty", "__proto__"]) {
      const result = await runCode("whatever", hostile);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("not supported");
    }
  });
});
