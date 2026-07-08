export { CODE_EXECUTION_QUEUE } from "@fluent/execution-contract";

export const WORKER_CONCURRENCY = parseInt(
  process.env["WORKER_CONCURRENCY"] ?? "5",
  10,
);
