export const CODE_EXECUTION_QUEUE = "code-execution";

export const WORKER_CONCURRENCY = parseInt(
  process.env["WORKER_CONCURRENCY"] ?? "5",
  10,
);
