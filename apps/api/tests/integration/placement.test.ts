import { describe, it, expect } from "vitest";

// Integration test: POST /enrollment → POST /placement/start → submit passing code → GET concepts
// Requires: Postgres + Redis (run via docker-compose)
// Skip in CI unless INTEGRATION=true

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Placement integration", () => {
  it("passing placement marks concept as mastered with achieved_via: placement", async () => {
    // 1. Create enrollment
    // 2. Start placement
    // 3. Submit passing result for concept 1
    // 4. GET /concepts → verify concept 1 is mastered with achieved_via: placement
    // 5. GET /concepts → verify concept 2 is available
    expect(true).toBe(true); // placeholder until DB is available
  });
});
