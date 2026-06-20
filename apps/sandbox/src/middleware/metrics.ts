import { Registry, Counter, Histogram, collectDefaultMetrics, Gauge } from "prom-client";
import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";

export const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "fluent_sandbox_" });

export const executionDuration = new Histogram({
  name: "fluent_sandbox_execution_duration_seconds",
  help: "Code execution job duration in seconds",
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30],
  registers: [registry],
});

export const executionsTotal = new Counter({
  name: "fluent_sandbox_executions_total",
  help: "Total code executions",
  labelNames: ["status"],
  registers: [registry],
});

export const activeWorkers = new Gauge({
  name: "fluent_sandbox_active_workers",
  help: "Number of active BullMQ workers",
  registers: [registry],
});

export function metricsMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  const start = Date.now();
  reply.raw.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    executionDuration.observe(duration);
  });
  done();
}
