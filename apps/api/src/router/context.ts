import type { FastifyRequest, FastifyReply } from "fastify";
import type { Session } from "next-auth";
import { prisma } from "../db/index.js";

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  session: Session | null;
  db: typeof prisma;
}

export async function createContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}): Promise<Context> {
  // Session populated by Auth.js middleware before tRPC router
  const session = (req as FastifyRequest & { session?: Session }).session ?? null;
  return { req, res, session, db: prisma };
}
