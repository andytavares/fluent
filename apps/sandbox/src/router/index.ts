import { router } from "./trpc.js";
import { executionRouter } from "./execution.js";

export const sandboxRouter = router({
  execution: executionRouter,
});

export type SandboxRouter = typeof sandboxRouter;
