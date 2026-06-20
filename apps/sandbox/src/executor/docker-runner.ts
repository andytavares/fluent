import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

const DOCKER_IMAGE = process.env["GO_RUNNER_IMAGE"] ?? "golang:1.21-alpine";
const TIMEOUT_MS = parseInt(process.env["EXECUTION_TIMEOUT_MS"] ?? "30000", 10);

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  runtimeMs: number | null;
  timedOut: boolean;
}

export async function runGoCode(code: string, testFiles?: string[]): Promise<ExecutionResult> {
  const runId = randomUUID();
  const dir = join(tmpdir(), `fluent-${runId}`);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "main.go"), code, "utf8");
    // go test requires a go.mod
    await writeFile(join(dir, "go.mod"), "module solution\n\ngo 1.21\n", "utf8");

    let cmd: string[];
    if (testFiles && testFiles.length > 0) {
      for (let i = 0; i < testFiles.length; i++) {
        await writeFile(join(dir, `solution_test.go`), testFiles[i]!, "utf8");
      }
      cmd = ["go", "test", "-v", "./..."];
    } else {
      cmd = ["go", "run", "main.go"];
    }

    const start = Date.now();

    const result = await execFileAsync(
      "docker",
      [
        "run",
        "--rm",
        "--network=none",
        "--memory=256m",
        "--ulimit", "nofile=1024:1024",
        "-v", `${dir}:/code:ro`,
        "-w", "/code",
        DOCKER_IMAGE,
        ...cmd,
      ],
      {
        timeout: TIMEOUT_MS,
        maxBuffer: 1024 * 1024, // 1 MB
      },
    ).then(
      ({ stdout, stderr }) => ({ stdout, stderr, timedOut: false, exitCode: 0 }),
      (err: NodeJS.ErrnoException & { stdout?: string; stderr?: string; killed?: boolean; code?: number | string }) => ({
        stdout: err.stdout ?? null,
        stderr: err.stderr ?? null,
        timedOut: err.killed === true || err.code === "ETIMEDOUT",
        exitCode: typeof err.code === "number" ? err.code : 1,
      }),
    );

    const runtimeMs = Date.now() - start;

    return {
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      exitCode: result.exitCode,
      runtimeMs,
      timedOut: result.timedOut,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
