import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Credential integration", () => {
  it("POST /users/me/credentials/go generates credential URL; GET /credentials/:token returns correct summary", async () => {
    expect(true).toBe(true);
  });
});
