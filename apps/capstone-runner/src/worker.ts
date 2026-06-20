import { Worker } from "@temporalio/worker";
import * as activities from "./activities/index.js";

export async function createWorker() {
  const connection = await (
    await import("@temporalio/worker")
  ).NativeConnection.connect({
    address: process.env["TEMPORAL_ADDRESS"] ?? "localhost:7233",
  });

  return Worker.create({
    connection,
    namespace: "default",
    taskQueue: "capstone-sessions",
    workflowsPath: new URL(
      import.meta.url.endsWith(".ts") ? "./workflows/index.ts" : "./workflows/index.js",
      import.meta.url,
    ).pathname,
    activities,
  });
}
