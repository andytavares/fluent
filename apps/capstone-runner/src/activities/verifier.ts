import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import pino from "pino";

const execAsync = promisify(exec);
const logger = pino({ base: { service: "capstone-runner" } });

// Verify scripts are authored content (ADR-005): content/capstone/<slug>/step-N/verify.sh
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const CAPSTONE_SLUG = process.env["CAPSTONE_SLUG"] ?? "go-crud-api";

export function verifyScriptPath(stepNumber: number, contentRoot: string = REPO_ROOT): string {
  return join(contentRoot, "content/capstone", CAPSTONE_SLUG, `step-${stepNumber}`, "verify.sh");
}

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

export async function verify(
  {
    sessionId,
    stepNumber,
  }: {
    sessionId: string;
    stepNumber: number;
  },
  contentRoot?: string,
): Promise<VerifyResult> {
  const scriptPath = verifyScriptPath(stepNumber, contentRoot);
  try {
    const { stdout } = await execAsync(`bash ${scriptPath}`, {
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

    // No test output means no tests ran — treat as failure (fail-safe)
    const passed = httpTests.length > 0 && httpTests.every((t) => t.passed);

    logger.info({ event: "verify_complete", sessionId, stepNumber, passed, testCount: httpTests.length });

    return { passed, http_tests: httpTests };
  } catch (err) {
    logger.error({ event: "verify_error", sessionId, stepNumber, err });
    return { passed: false, http_tests: [] };
  }
}
