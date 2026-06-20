import pino from "pino";
import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import { randomUUID } from "node:crypto";

export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  base: { service: "api" },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function loggerMiddleware(
  req: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  (req as FastifyRequest & { requestId: string }).requestId = requestId;

  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    remoteAddress: req.ip,
  });

  done();
}
