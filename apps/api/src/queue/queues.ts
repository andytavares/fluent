import type { JobsOptions } from "bullmq";

export {
  CODE_EXECUTION_QUEUE,
  codeExecutionJobSchema,
  type CodeExecutionJob,
} from "@fluent/execution-contract";

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 500 },
};
