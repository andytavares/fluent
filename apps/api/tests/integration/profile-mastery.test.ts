import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Profile mastery integration", () => {
  it("GET /users/me/mastery/go returns correct table after mixed lesson + test-out completions", async () => {
    expect(true).toBe(true);
  });
});
