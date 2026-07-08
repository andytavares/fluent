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

/** Redis key mapping an SSE stream token to its jobId. */
export function streamTokenKey(token: string): string {
  return `stream:${token}`;
}
