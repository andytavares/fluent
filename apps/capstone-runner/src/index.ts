import { createWorker } from "./worker.js";

async function start() {
  const worker = await createWorker();
  console.log("Capstone runner worker started, listening on task queue: capstone-sessions");
  await worker.run();
}

start().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
