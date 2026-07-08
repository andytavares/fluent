import { describe, it, expect } from "vitest";

// EXECUTION_TIMEOUT_MS is read at module load, so this file sets it before
// importing the runner and lives alone so no other import wins the race.
process.env["EXECUTION_TIMEOUT_MS"] = "1500";
const { runCode } = await import("../../src/executor/polyglot-runner.js");

describe("polyglot-runner: wall-clock timeout", () => {
  it("kills a run that exceeds EXECUTION_TIMEOUT_MS and flags timedOut", async () => {
    // setInterval keeps the process alive past the 1.5s ceiling
    const result = await runCode("setInterval(() => {}, 1000);", "javascript");
    expect(result.timedOut).toBe(true);
  }, 10_000);
});
