import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    // Unit tests only — tests/e2e/*.spec.ts are Playwright suites and must
    // not be collected by vitest.
    include: ["tests/unit/**/*.test.ts"],
  },
});
