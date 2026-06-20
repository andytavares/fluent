import type { FastifyRequest, FastifyReply } from "fastify";

export interface SandboxContext {
  req: FastifyRequest;
  res: FastifyReply;
  userId: string | null;
}

export async function createSandboxContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}): Promise<SandboxContext> {
  const userId = (req.headers["x-user-id"] as string | undefined) ?? null;
  return { req, res, userId };
}
