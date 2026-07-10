import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

const startCapstoneWorkflow = vi.fn();
const signalLearnerActive = vi.fn();
const signalVerifyStep = vi.fn();

vi.mock("../../src/temporal/capstone-client.js", () => ({
  startCapstoneWorkflow,
  signalLearnerActive,
  signalVerifyStep,
}));

const { capstoneRouter } = await import("../../src/router/capstone.js");

// Unit tests for the two new deploy/query procedures (forward to
// capstone-runner's internal HTTP server) and the createSession rollback
// fix. Ownership is re-verified on every procedure the same way
// submissions.getSubmission does (session.userId !== ctx.user.id -> FORBIDDEN).

function makeMockDb(overrides: Record<string, unknown> = {}) {
  return {
    capstoneSessions: {
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    enrollment: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "enr-1", track: { slug: "go" } }),
    },
    ...overrides,
  };
}

function caller(db: ReturnType<typeof makeMockDb>, userId: string) {
  return capstoneRouter.createCaller({
    req: {} as never,
    res: {} as never,
    db: db as never,
    session: { user: { id: userId }, expires: "" } as never,
  });
}

beforeEach(() => {
  startCapstoneWorkflow.mockReset();
  signalLearnerActive.mockReset();
  signalVerifyStep.mockReset();
  vi.unstubAllGlobals();
});

describe("getProject", () => {
  it("returns the go capstone project for the go track", async () => {
    const db = makeMockDb();
    const result = await caller(db, "u1").getProject({ trackSlug: "go" });

    expect(result).toEqual({
      slug: "go-crud-api",
      title: "Go CRUD API",
      description: expect.any(String),
      language: "go",
      stub: expect.stringContaining("package main"),
    });
  });

  it("returns null for a track with no capstone at all", async () => {
    const db = makeMockDb();
    const result = await caller(db, "u1").getProject({ trackSlug: "not-a-track" });

    expect(result).toBeNull();
  });
});

describe("deployCode", () => {
  it("forwards to the capstone-runner deploy endpoint and returns its response", async () => {
    const db = makeMockDb();
    db.capstoneSessions.findUniqueOrThrow.mockResolvedValue({
      id: "7369a0e5-fec3-4821-8b19-1bd46b2d004e",
      userId: "u1",
      enrollmentId: "enr-1",
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ compileLog: "listening on :8080" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await caller(db, "u1").deployCode({ sessionId: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", code: "package main" });

    expect(result).toEqual({
      compileLog: "listening on :8080",
      complexity: expect.objectContaining({ time: expect.any(String), space: expect.any(String), basis: expect.any(String) }),
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/sessions/7369a0e5-fec3-4821-8b19-1bd46b2d004e/deploy"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ code: "package main", language: "go" }) }),
    );
  });

  it("rejects when the session belongs to a different user", async () => {
    const db = makeMockDb();
    db.capstoneSessions.findUniqueOrThrow.mockResolvedValue({ id: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", userId: "someone-else" });
    vi.stubGlobal("fetch", vi.fn());

    await expect(caller(db, "u1").deployCode({ sessionId: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", code: "x" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("throws a TRPCError when capstone-runner responds non-2xx", async () => {
    const db = makeMockDb();
    db.capstoneSessions.findUniqueOrThrow.mockResolvedValue({ id: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", userId: "u1" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "session pod not found" }) }),
    );

    await expect(caller(db, "u1").deployCode({ sessionId: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", code: "x" })).rejects.toThrow(TRPCError);
  });
});

describe("runQuery", () => {
  it("forwards to the capstone-runner query endpoint and returns its response", async () => {
    const db = makeMockDb();
    db.capstoneSessions.findUniqueOrThrow.mockResolvedValue({ id: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", userId: "u1" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ kind: "rows", columns: ["id"], rows: [["1"]] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await caller(db, "u1").runQuery({ sessionId: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", sql: "SELECT 1" });

    expect(result).toEqual({ kind: "rows", columns: ["id"], rows: [["1"]] });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/sessions/7369a0e5-fec3-4821-8b19-1bd46b2d004e/query"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ sql: "SELECT 1" }) }),
    );
  });

  it("rejects when the session belongs to a different user", async () => {
    const db = makeMockDb();
    db.capstoneSessions.findUniqueOrThrow.mockResolvedValue({ id: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", userId: "someone-else" });
    vi.stubGlobal("fetch", vi.fn());

    await expect(caller(db, "u1").runQuery({ sessionId: "7369a0e5-fec3-4821-8b19-1bd46b2d004e", sql: "SELECT 1" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("createSession rollback", () => {
  it("deletes the just-created session row and throws a clean TRPCError when the workflow fails to start", async () => {
    const db = makeMockDb({
      enrollment: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "enr-1", track: { slug: "go" } }),
      },
      conceptState: { findMany: vi.fn().mockResolvedValue([]) },
    });
    db.capstoneSessions.findFirst.mockResolvedValue(null);
    db.capstoneSessions.create.mockResolvedValue({ id: "429f1d07-44c3-4ad0-a4a4-f99ebb1f3c6e", userId: "u1", enrollmentId: "a0ce93eb-bcb9-430a-b32c-ff0c1c30beac" });
    db.capstoneSessions.delete.mockResolvedValue({});
    startCapstoneWorkflow.mockRejectedValue(new Error("Failed to connect before the deadline"));

    // CapstonePrereqService.assertAllConceptsMastered queries conceptState directly;
    // stub it via the mocked db's conceptState.findMany returning no unmastered concepts.
    const { CapstonePrereqService } = await import("../../src/service/capstone-prereq.js");
    vi.spyOn(CapstonePrereqService.prototype, "assertAllConceptsMastered").mockResolvedValue(undefined);

    await expect(caller(db, "u1").createSession({ enrollmentId: "a0ce93eb-bcb9-430a-b32c-ff0c1c30beac" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: expect.not.stringMatching(/deadline/i),
    });

    expect(db.capstoneSessions.delete).toHaveBeenCalledWith({ where: { id: "429f1d07-44c3-4ad0-a4a4-f99ebb1f3c6e" } });
  });
});
