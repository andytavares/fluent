import { initTRPC, TRPCError } from "@trpc/server";
import type { SandboxContext } from "./context.js";

const t = initTRPC.context<SandboxContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
