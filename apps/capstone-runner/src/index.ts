import { createWorker } from "./worker.js";
import { buildServer } from "./server.js";

const PORT = parseInt(process.env["CAPSTONE_RUNNER_PORT"] ?? "3004", 10);
const HOST = process.env["HOST"] ?? "0.0.0.0";

async function start() {
  const worker = await createWorker();

  const server = buildServer();
  await server.listen({ port: PORT, host: HOST });
  console.log(`Capstone runner internal server listening on ${HOST}:${PORT}`);

  console.log("Capstone runner worker started, listening on task queue: capstone-sessions");
  await worker.run();
}

start().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
