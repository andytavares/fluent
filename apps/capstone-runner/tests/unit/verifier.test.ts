import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verify } from "../../src/activities/verifier.js";

// Tests the shipping verify() activity end to end: it shells out to bash and
// parses the script's JSON-lines output.

let dir: string;

async function script(name: string, body: string): Promise<string> {
  const path = join(dir, name);
  await writeFile(path, `#!/bin/bash\n${body}\n`);
  await chmod(path, 0o755);
  return path;
}

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "fluent-verify-"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("verify activity", () => {
  it("passes when every HTTP test line passes", async () => {
    const path = await script(
      "pass.sh",
      `echo '{"method":"GET","path":"/health","status":200,"passed":true}'
echo '{"method":"POST","path":"/users","status":201,"passed":true}'`,
    );

    const result = await verify({ sessionId: "s1", stepNumber: 1, verifyScriptPath: path });

    expect(result.passed).toBe(true);
    expect(result.http_tests).toHaveLength(2);
  });

  it("fails when any HTTP test fails", async () => {
    const path = await script(
      "fail.sh",
      `echo '{"method":"GET","path":"/health","status":200,"passed":true}'
echo '{"method":"POST","path":"/users","status":500,"passed":false}'`,
    );

    const result = await verify({ sessionId: "s1", stepNumber: 1, verifyScriptPath: path });

    expect(result.passed).toBe(false);
  });

  it("treats invalid JSON lines as failed tests", async () => {
    const path = await script("garbage.sh", "echo 'not json'");

    const result = await verify({ sessionId: "s1", stepNumber: 1, verifyScriptPath: path });

    expect(result.passed).toBe(false);
    expect(result.http_tests[0]?.method).toBe("UNKNOWN");
  });

  it("treats empty output as failure (nothing ran means nothing verified)", async () => {
    const path = await script("empty.sh", "true");

    const result = await verify({ sessionId: "s1", stepNumber: 1, verifyScriptPath: path });

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("fails safe when the script itself errors", async () => {
    const result = await verify({
      sessionId: "s1",
      stepNumber: 1,
      verifyScriptPath: join(dir, "does-not-exist.sh"),
    });

    expect(result.passed).toBe(false);
    expect(result.http_tests).toHaveLength(0);
  });

  it("exposes SESSION_ID and STEP_NUMBER to the script", async () => {
    const path = await script(
      "env.sh",
      `echo "{\\"method\\":\\"GET\\",\\"path\\":\\"/$SESSION_ID/$STEP_NUMBER\\",\\"status\\":200,\\"passed\\":true}"`,
    );

    const result = await verify({ sessionId: "sess-9", stepNumber: 4, verifyScriptPath: path });

    expect(result.http_tests[0]?.path).toBe("/sess-9/4");
  });
});
