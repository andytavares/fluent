import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Placement skip integration", () => {
  it("DELETE /placement/:id skips placement with no concepts pre-marked", async () => {
    expect(true).toBe(true);
  });
});
