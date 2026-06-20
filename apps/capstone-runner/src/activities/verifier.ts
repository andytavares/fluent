import { exec } from "node:child_process";
import { promisify } from "node:util";
import pino from "pino";

const execAsync = promisify(exec);
const logger = pino({ base: { service: "capstone-runner" } });

interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
  response_body?: unknown;
}

interface VerifyResult {
  passed: boolean;
  http_tests: HttpTestResult[];
}

export async function verify({
  sessionId,
  stepNumber,
  verifyScriptPath,
}: {
  sessionId: string;
  stepNumber: number;
  verifyScriptPath: string;
}): Promise<VerifyResult> {
  try {
    const { stdout } = await execAsync(`bash ${verifyScriptPath}`, {
      timeout: 30_000,
      env: { ...process.env, SESSION_ID: sessionId, STEP_NUMBER: String(stepNumber) },
    });

    // verify.sh must output JSON per HTTP test (one JSON object per line, or array)
    const lines = stdout.trim().split("\n").filter(Boolean);
    const httpTests: HttpTestResult[] = lines.map((line) => {
      try {
        return JSON.parse(line) as HttpTestResult;
      } catch {
        return { method: "UNKNOWN", path: "/", status: 0, passed: false };
      }
    });

    const passed = httpTests.every((t) => t.passed);

    logger.info({ event: "verify_complete", sessionId, stepNumber, passed, testCount: httpTests.length });

    return { passed, http_tests: httpTests };
  } catch (err) {
    logger.error({ event: "verify_error", sessionId, stepNumber, err });
    return { passed: false, http_tests: [] };
  }
}
