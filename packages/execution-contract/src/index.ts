import { z } from "zod";

// Contract for code-execution jobs, shared by the API (BullMQ producer) and
// the sandbox (BullMQ worker). One schema, one queue name, one set of Redis
// key shapes — declared once, imported on both sides of the seam.

export const CODE_EXECUTION_QUEUE = "code-execution";

// ── Timing ────────────────────────────────────────────────────────────────
// The execution ceiling, retry policy, and how long a client may wait on a
// result stream are one budget — declared together so no consumer can
// undercut another (e.g. an SSE cap shorter than the retry envelope).

export const DEFAULT_EXECUTION_TIMEOUT_MS = 30_000;
export const EXECUTION_ATTEMPTS = 3;
export const EXECUTION_BACKOFF_MS = 1000;

/**
 * Parses the EXECUTION_TIMEOUT_MS override, guarded against garbage. Callers
 * pass the raw env value — this module stays browser-safe (no process).
 */
export function executionTimeoutMs(env: string | undefined): number {
  const parsed = parseInt(env ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXECUTION_TIMEOUT_MS;
}

/**
 * Max wall-clock a stream consumer should wait for a result: the full retry
 * envelope (attempts × ceiling + exponential backoff) plus scheduling margin.
 */
export function streamMaxWaitMs(executionTimeoutMs = DEFAULT_EXECUTION_TIMEOUT_MS): number {
  const backoffTotal = EXECUTION_BACKOFF_MS * (2 ** (EXECUTION_ATTEMPTS - 1) - 1);
  const schedulingMarginMs = 7_000;
  return EXECUTION_ATTEMPTS * executionTimeoutMs + backoffTotal + schedulingMarginMs;
}

// ── Trace protocol ────────────────────────────────────────────────────────
// Shape of one visualizer trace frame: emitted by the sandbox runners'
// __TRACE__ shim, carried in the result stream, rendered by the web UI.

export interface TraceFrame {
  label?: string;
  state?: Record<string, unknown>;
  highlights?: {
    arrays?: Record<string, number[]>;
    nodes?: string[];
  };
}

export const codeExecutionJobSchema = z.object({
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  conceptId: z.string().uuid().optional(),
  exerciseId: z.string().uuid().optional(),
  code: z.string(),
  language: z.string().default("go"),
  isSuite: z.boolean().default(false),
  testFiles: z.array(z.string()).optional(),
});

export type CodeExecutionJob = z.infer<typeof codeExecutionJobSchema>;

/** Redis Stream the worker writes execution output/results to. */
export function resultStreamKey(jobId: string): string {
  return `result:${jobId}`;
}

/** One entry of the result stream, flattened from Redis' [field, value, ...] shape. */
export function flattenStreamFields(fields: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]!] = fields[i + 1]!;
  }
  return obj;
}

export interface ExecutionResultEvent {
  exitCode: number;
  runtimeMs: number;
  timedOut: boolean;
}

export interface ParsedResultStream {
  stdout: string[];
  stderr: string[];
  /** Raw JSON payloads of trace entries, in stream order. */
  traceJson: string[];
  /** The terminal result entry, or null if the worker hasn't finished. */
  result: ExecutionResultEvent | null;
}

/** Parses a full XRANGE read of a result stream into the worker's wire shape. */
export function parseResultStream(entries: Array<[string, string[]]>): ParsedResultStream {
  const parsed: ParsedResultStream = { stdout: [], stderr: [], traceJson: [], result: null };

  for (const [, fields] of entries) {
    const obj = flattenStreamFields(fields);
    if (obj["type"] === "stdout" && obj["data"]) parsed.stdout.push(obj["data"]);
    if (obj["type"] === "stderr" && obj["data"]) parsed.stderr.push(obj["data"]);
    if (obj["type"] === "trace" && obj["data"]) parsed.traceJson.push(obj["data"]);
    if (obj["type"] === "result") {
      parsed.result = {
        exitCode: parseInt(obj["exit_code"] ?? "-1", 10),
        runtimeMs: parseInt(obj["runtime_ms"] ?? "0", 10),
        timedOut: obj["timed_out"] === "true",
      };
    }
  }

  return parsed;
}

/** Redis key mapping an SSE stream token to its jobId. */
export function streamTokenKey(token: string): string {
  return `stream:${token}`;
}
