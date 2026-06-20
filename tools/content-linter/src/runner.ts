import { exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execAsync = promisify(exec);

export interface RunnerResult {
  stubBuilds: boolean;
  exemplarPasses: boolean;
  stdout: string;
  stderr: string;
}

export async function runExerciseChecks(folderPath: string): Promise<RunnerResult> {
  // Check stub compiles
  let stubBuilds = false;
  let stubStderr = "";
  try {
    await execAsync(`go build ${join(folderPath, "stub.go")}`, {
      cwd: folderPath,
      timeout: 30_000,
    });
    stubBuilds = true;
  } catch (err) {
    stubStderr = (err as { stderr?: string }).stderr ?? String(err);
  }

  // Run exemplar tests
  let exemplarPasses = false;
  let testStdout = "";
  let testStderr = "";
  try {
    const result = await execAsync("go test ./...", {
      cwd: folderPath,
      timeout: 30_000,
      env: {
        ...process.env,
        GOFLAGS: "-v",
        EXERCISE_FILE: "exemplar.go",
      },
    });
    testStdout = result.stdout;
    exemplarPasses = true;
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    testStdout = e.stdout ?? "";
    testStderr = e.stderr ?? String(err);
  }

  return {
    stubBuilds,
    exemplarPasses,
    stdout: testStdout,
    stderr: stubStderr || testStderr,
  };
}
