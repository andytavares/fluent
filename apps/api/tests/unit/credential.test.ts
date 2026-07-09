import { describe, it, expect, vi } from "vitest";
import { CredentialService } from "../../src/service/credential.js";

function makeMockDb() {
  return {
    track: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: "track1",
        title: "Go Track",
        concepts: [{ id: "c1" }, { id: "c2" }],
      }),
    },
    enrollment: {
      // Serves both the credential's own lookup and LearnerProgressService's
      // progress query (which needs the state/event/session collections).
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: "enr1",
        completedAt: new Date("2025-01-01"),
        user: { name: "Alice" },
        conceptStates: [],
        capstoneSessions: [],
        masteryEvents: [
          { achievedVia: "test_out", lessonAvgTimeMs: null },
          { achievedVia: "lesson", lessonAvgTimeMs: null },
        ],
      }),
    },
    credential: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "cred1", ...data })),
    },
  };
}

describe("CredentialService.generateCredential", () => {
  it("creates a credential with a URL-safe token", async () => {
    const db = makeMockDb();
    const service = new CredentialService(db as never);

    const result = await service.generateCredential("usr1", "go");

    expect(db.credential.create).toHaveBeenCalledOnce();
    const { token, summary } = (db.credential.create.mock.calls[0]![0] as { data: { token: string; summary: Record<string, unknown> } }).data;
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(42);
    expect(summary).toMatchObject({
      name: "Alice",
      track_title: "Go Track",
      tested_out_count: 1,
      concepts_total: 2,
    });
    expect(result).toBeDefined();
  });

  it("generates a unique token on each call", async () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const db = makeMockDb();
      const service = new CredentialService(db as never);
      await service.generateCredential("usr1", "go");
      const token = (db.credential.create.mock.calls[0]![0] as { data: { token: string } }).data.token;
      tokens.add(token);
    }
    expect(tokens.size).toBe(10);
  });
});
