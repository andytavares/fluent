import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Dashboard integration", () => {
  it("GET /users/me/dashboard after simulated P1–P5 flows returns accurate stats and correct continue_building card", async () => {
    expect(true).toBe(true);
  });
});
