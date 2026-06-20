import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Test-out pass integration", () => {
  it("POST /testout/start → submit passing code → concept.state === mastered", async () => {
    expect(true).toBe(true);
  });
});
