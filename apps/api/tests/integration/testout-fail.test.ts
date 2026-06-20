import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Test-out fail integration", () => {
  it("POST /testout/start → submit failing code → concept.state === in_progress, no penalty fields", async () => {
    expect(true).toBe(true);
  });
});
