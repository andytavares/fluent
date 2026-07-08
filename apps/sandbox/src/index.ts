import Fastify from "fastify";
import { loggerMiddleware } from "./middleware/logger.js";
import { metricsMiddleware } from "./middleware/metrics.js";
import { registerInternalRoutes } from "./router/internal.js";
import { createExecutionWorker } from "./worker/execution-worker.js";

const PORT = parseInt(process.env["SANDBOX_PORT"] ?? process.env["PORT"] ?? "3002", 10);
const HOST = process.env["HOST"] ?? "0.0.0.0";

async function start() {
  createExecutionWorker();

  const app = Fastify({ logger: false });

  app.addHook("onRequest", loggerMiddleware);
  app.addHook("onRequest", metricsMiddleware);

  registerInternalRoutes(app);

  await app.listen({ port: PORT, host: HOST });
  console.log(`Sandbox server listening on ${HOST}:${PORT}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
