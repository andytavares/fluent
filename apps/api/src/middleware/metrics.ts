import { Registry, Counter, Histogram, collectDefaultMetrics } from "prom-client";
import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";

export const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "fluent_api_" });

export const httpRequestDuration = new Histogram({
  name: "fluent_api_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const httpRequestsTotal = new Counter({
  name: "fluent_api_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

export const submissionErrorsTotal = new Counter({
  name: "fluent_api_submission_errors_total",
  help: "Total submission errors",
  labelNames: ["type"],
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
    const route = req.routeOptions?.url ?? req.url ?? "unknown";
    const labels = {
      method: req.method,
      route,
      status_code: String(reply.statusCode),
    };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });
  done();
}
