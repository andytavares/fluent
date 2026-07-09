import type { JobsOptions } from "bullmq";
import { EXECUTION_ATTEMPTS, EXECUTION_BACKOFF_MS } from "@fluent/execution-contract";

export {
  CODE_EXECUTION_QUEUE,
  codeExecutionJobSchema,
  type CodeExecutionJob,
} from "@fluent/execution-contract";

export const defaultJobOptions: JobsOptions = {
  attempts: EXECUTION_ATTEMPTS,
  backoff: { type: "exponential", delay: EXECUTION_BACKOFF_MS },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 500 },
};
