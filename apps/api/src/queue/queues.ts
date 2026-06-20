import type { JobsOptions } from "bullmq";
import { z } from "zod";

export const QUEUES = {
  CODE_EXECUTION: "code-execution",
} as const;

export const codeExecutionJobSchema = z.object({
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  conceptId: z.string().uuid(),
  exerciseId: z.string().uuid().optional(),
  code: z.string(),
  language: z.string().default("go"),
  isSuite: z.boolean().default(false),
  testFiles: z.array(z.string()).optional(),
});

export type CodeExecutionJob = z.infer<typeof codeExecutionJobSchema>;

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 500 },
};
