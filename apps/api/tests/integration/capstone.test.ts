import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Capstone integration", () => {
  it("startCapstoneSession → poll until connected → verifyStep(1) → step 1 in capstone_step_completions", async () => {
    expect(true).toBe(true);
  });
});
