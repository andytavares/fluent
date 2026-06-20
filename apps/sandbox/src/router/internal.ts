import { redis } from "../db/redis.js";
import { registry } from "../middleware/metrics.js";
import { streamExecutionResult } from "../streamer/sse-streamer.js";
import type { FastifyInstance } from "fastify";

export function registerInternalRoutes(app: FastifyInstance) {
  app.get("/healthz", () => ({ status: "ok" }));

  app.get("/readyz", async () => {
    await redis.ping();
    return { status: "ok" };
  });

  app.get("/metrics", async (_req, reply) => {
    const metrics = await registry.metrics();
    void reply.header("Content-Type", registry.contentType).send(metrics);
  });

  app.get("/stream/:token", async (req, reply) => {
    const { token } = req.params as { token: string };
    const jobId = await redis.get(`stream:${token}`);
    if (!jobId) {
      void reply.status(404).send({ error: "Stream not found" });
      return;
    }
    await streamExecutionResult(jobId, reply);
  });
}
