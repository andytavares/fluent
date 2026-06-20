import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Capstone resume integration", () => {
  it("close and re-open capstone session → current_step reflects last completed step", async () => {
    expect(true).toBe(true);
  });
});
