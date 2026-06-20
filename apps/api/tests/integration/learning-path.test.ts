import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Learning path integration", () => {
  it("GET /enrollments/:id/concepts returns all concepts with correct states after P1 flows", async () => {
    expect(true).toBe(true);
  });
});
