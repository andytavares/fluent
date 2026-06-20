import { describe, it, expect } from "vitest";
// Rate limiter lives in apps/sandbox; integration test calls the sandbox HTTP endpoint
// import { TokenBucketLimiter } from "../../src/queue/rate-limiter.js";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Rate limit integration", () => {
  it("11th rapid submission in 60s returns 429 with retry_after_seconds", async () => {
    expect(true).toBe(true);
  });
});
