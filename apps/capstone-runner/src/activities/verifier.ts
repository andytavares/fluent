import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import pino from "pino";
import { findSessionPod, execInPod } from "../k8s.js";

const logger = pino({ base: { service: "capstone-runner" } });

// Verify scripts and fixtures are authored content (ADR-005):
// content/capstone/<slug>/step-N/{verify.sh,fixtures.sql}
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const CAPSTONE_SLUG = process.env["CAPSTONE_SLUG"] ?? "go-crud-api";

export function verifyScriptPath(stepNumber: number, contentRoot: string = REPO_ROOT): string {
  return join(contentRoot, "content/capstone", CAPSTONE_SLUG, `step-${stepNumber}`, "verify.sh");
}

export function fixturesPath(stepNumber: number, contentRoot: string = REPO_ROOT): string {
  return join(contentRoot, "content/capstone", CAPSTONE_SLUG, `step-${stepNumber}`, "fixtures.sql");
}

export interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
  response_body?: unknown;
}

export interface VerifyResult {
  passed: boolean;
  http_tests: HttpTestResult[];
}

/** Parses verify.sh's JSON-lines stdout contract (one HTTP test result per line). */
export function parseHttpTestOutput(stdout: string): HttpTestResult[] {
  const lines = stdout.trim().split("\n").filter(Boolean);
  return lines.map((line) => {
    try {
      return JSON.parse(line) as HttpTestResult;
    } catch {
      return { method: "UNKNOWN", path: "/", status: 0, passed: false };
    }
  });
}

/**
 * Best-effort fixture load: exec's fixtures.sql content into the pod's
 * postgres container. ON_ERROR_STOP=0 is deliberate — if the learner hasn't
 * created their table yet, fixtures loading should fail quietly rather than
 * aborting verification (the subsequent HTTP checks will legitimately fail
 * on their own).
 */
async function loadFixtures(podName: string, stepNumber: number, contentRoot: string | undefined): Promise<void> {
  let fixturesSql: string;
  try {
    fixturesSql = readFileSync(fixturesPath(stepNumber, contentRoot), "utf8");
  } catch {
    return;
  }

  try {
    // Fixtures travel as a positional argv element ($1), not stdin —
    // execInPod deliberately has no stdin (see k8s.ts). psql -c accepts
    // multiple semicolon-separated statements in one string.
    await execInPod(podName, "postgres", [
      "sh",
      "-c",
      'PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -U postgres -d capstone -v ON_ERROR_STOP=0 -c "$1"',
      "sh",
      fixturesSql,
    ]);
  } catch (err) {
    logger.warn({ event: "fixtures_load_failed", stepNumber, err });
  }
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
  try {
    const podName = await findSessionPod(sessionId);

    await loadFixtures(podName, stepNumber, contentRoot);

    const verifyScriptContent = readFileSync(verifyScriptPath(stepNumber, contentRoot), "utf8");

    // The script content is $1, session/step are $2/$3 — all positional,
    // never interpolated into the script text, and no stdin (see k8s.ts).
    const result = await execInPod(podName, "app", [
      "sh",
      "-c",
      'printf \'%s\' "$1" > /tmp/verify.sh && SESSION_ID="$2" STEP_NUMBER="$3" bash /tmp/verify.sh',
      "sh",
      verifyScriptContent,
      sessionId,
      String(stepNumber),
    ]);

    const httpTests = parseHttpTestOutput(result.stdout);

    // No test output means no tests ran — treat as failure (fail-safe)
    const passed = httpTests.length > 0 && httpTests.every((t) => t.passed);

    logger.info({ event: "verify_complete", sessionId, stepNumber, passed, testCount: httpTests.length });

    return { passed, http_tests: httpTests };
  } catch (err) {
    logger.error({ event: "verify_error", sessionId, stepNumber, err });
    return { passed: false, http_tests: [] };
  }
}
