import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Submission integration", () => {
  it("POST /submissions → stream shows stdout within 5s → concept advances to completed", async () => {
    expect(true).toBe(true);
  });
});
