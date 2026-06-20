import { router, publicProcedure } from "./trpc.js";
import { registry } from "../middleware/metrics.js";
import { prisma } from "../db/index.js";

// /healthz and /readyz are registered directly on Fastify in index.ts
// This router exposes internal tRPC procedures for service-to-service calls

export const internalRouter = router({
  healthz: publicProcedure.query(() => ({ status: "ok" as const })),

  readyz: publicProcedure.query(async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" as const };
  }),

  metrics: publicProcedure.query(async () => {
    return registry.metrics();
  }),
});
