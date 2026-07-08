import { z } from "zod";

// Contract for code-execution jobs, shared by the API (BullMQ producer) and
// the sandbox (BullMQ worker). One schema, one queue name, one set of Redis
// key shapes — declared once, imported on both sides of the seam.

export const CODE_EXECUTION_QUEUE = "code-execution";

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
