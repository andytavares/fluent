import Fastify, { type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { prisma } from "./db/index.js";
import { appRouter } from "./router/index.js";
import { createContext } from "./router/context.js";
import { loggerMiddleware } from "./middleware/logger.js";
import { metricsMiddleware } from "./middleware/metrics.js";
import type { Session } from "next-auth";

const PORT = parseInt(process.env["PORT"] ?? "3001", 10);
const HOST = process.env["HOST"] ?? "0.0.0.0";

function parseCookies(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((c) => {
      const idx = c.indexOf("=");
      return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())];
    }),
  );
}

async function start() {
  const app = Fastify({ logger: false });

  const allowedOrigin = process.env["WEB_URL"] ?? "http://localhost:3000";
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || origin === allowedOrigin || origin.startsWith("http://localhost:")) {
        cb(null, true);
      } else {
        cb(new Error("CORS: origin not allowed"), false);
      }
    },
    credentials: true,
  });

  // Validate NextAuth session cookie and attach session to request
  app.addHook("onRequest", async (req) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return;

    const cookies = parseCookies(cookieHeader);
    const sessionToken =
      cookies["authjs.session-token"] ?? cookies["__Secure-authjs.session-token"];
    if (!sessionToken) return;

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!dbSession || dbSession.expires < new Date()) return;

    (req as FastifyRequest & { session?: Session }).session = {
      user: {
        id: dbSession.user.id,
        email: dbSession.user.email ?? "",
        name: dbSession.user.name,
        image: dbSession.user.image,
      },
      expires: dbSession.expires.toISOString(),
    };
  });

  app.addHook("onRequest", loggerMiddleware);
  app.addHook("onRequest", metricsMiddleware);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  app.get("/healthz", () => ({ status: "ok" }));
  app.get("/readyz", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  });

  await app.listen({ port: PORT, host: HOST });
  console.log(`API server listening on ${HOST}:${PORT}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
