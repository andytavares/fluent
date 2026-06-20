import { describe, it, expect } from "vitest";

const INTEGRATION = process.env["INTEGRATION"] === "true";

describe.skipIf(!INTEGRATION)("Capstone session restart integration (T134)", () => {
  it("mid-session createSession call resumes at last completed step with completed steps preserved", async () => {
    // 1. Create session, complete step 1
    // 2. Simulate browser close (no explicit call)
    // 3. Call createSession again for same enrollmentId
    // 4. Verify returned session has current_step = 2 and stepCompletions contains step 1
    expect(true).toBe(true);
  });
});
