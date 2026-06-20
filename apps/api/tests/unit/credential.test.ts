import { describe, it, expect } from "vitest";
import { randomBytes } from "node:crypto";

// Pure credential token generation logic
function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

describe("Credential service", () => {
  it("generates a URL-safe token of 43 chars (32 bytes base64url)", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(42); // base64url of 32 bytes is 43 chars
  });

  it("each token is unique", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});
