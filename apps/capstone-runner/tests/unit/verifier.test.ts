import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verify, verifyScriptPath } from "../../src/activities/verifier.js";

// Tests the shipping verify() activity end to end: it resolves the step's
// verify.sh from authored content, shells out to bash, and parses the
// script's JSON-lines output.

let contentRoot: string;

async function writeStepScript(stepNumber: number, body: string): Promise<void> {
  const dir = join(contentRoot, "content/capstone/go-crud-api", `step-${stepNumber}`);
  await mkdir(dir, { recursive: true });
  const path = join(dir, "verify.sh");
  await writeFile(path, `#!/bin/bash\n${body}\n`);
  await chmod(path, 0o755);
}

beforeAll(async () => {
  contentRoot = await mkdtemp(join(tmpdir(), "fluent-verify-"));
});

afterAll(async () => {
  await rm(contentRoot, { recursive: true, force: true });
});

describe("verifyScriptPath", () => {
  it("resolves the step's verify.sh inside the capstone content tree", () => {
    expect(verifyScriptPath(4, "/repo")).toBe("/repo/content/capstone/go-crud-api/step-4/verify.sh");
  });
});

describe("verify activity", () => {
  it("passes when every HTTP test line passes", async () => {
    await writeStepScript(
      1,
      `echo '{"method":"GET","path":"/health","status":200,"passed":true}'
echo '{"method":"POST","path":"/users","status":201,"passed":true}'`,
    );

    const result = await verify({ sessionId: "s1", stepNumber: 1 }, contentRoot);

    expect(result.passed).toBe(true);
    expect(result.http_tests).toHaveLength(2);
  });

  it("fails when any HTTP test fails", async () => {
    await writeStepScript(
      2,
      `echo '{"method":"GET","path":"/health","status":200,"passed":true}'
echo '{"method":"POST","path":"/users","status":500,"passed":false}'`,
    );

    const result = await verify({ sessionId: "s1", stepNumber: 2 }, contentRoot);

    expect(result.passed).toBe(false);
  });

  it("treats invalid JSON lines as failed tests", async () => {
    await writeStepScript(3, "echo 'not json'");

    const result = await verify({ sessionId: "s1", stepNumber: 3 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests[0]?.method).toBe("UNKNOWN");
  });

  it("treats empty output as failure (nothing ran means nothing verified)", async () => {
    await writeStepScript(4, "true");

    const result = await verify({ sessionId: "s1", stepNumber: 4 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("fails safe when the step has no verify script", async () => {
    const result = await verify({ sessionId: "s1", stepNumber: 99 }, contentRoot);

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("exposes SESSION_ID and STEP_NUMBER to the script", async () => {
    await writeStepScript(
      5,
      `echo "{\\"method\\":\\"GET\\",\\"path\\":\\"/$SESSION_ID/$STEP_NUMBER\\",\\"status\\":200,\\"passed\\":true}"`,
    );

    const result = await verify({ sessionId: "sess-9", stepNumber: 5 }, contentRoot);

    expect(result.http_tests[0]?.path).toBe("/sess-9/5");
  });

  it("runs the real repo's step-1 verify script path by default", () => {
    // Default content root resolves inside this repository
    expect(verifyScriptPath(1)).toContain("content/capstone/go-crud-api/step-1/verify.sh");
  });
});
