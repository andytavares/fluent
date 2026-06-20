import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/api/vitest.config.ts",
  "apps/sandbox/vitest.config.ts",
  "apps/capstone-runner/vitest.config.ts",
  "packages/ui/vitest.config.ts",
  "tools/content-linter/vitest.config.ts",
]);
