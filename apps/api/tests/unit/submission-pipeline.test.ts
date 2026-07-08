import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmissionPipeline, interpretResult } from "../../src/service/submission-pipeline.js";

function makeMockDb() {
  return {
    submission: {
      create: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "sub1", passed: null, ...data }),
      ),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "sub1", userId: "usr1", conceptId: "con1", isSuite: true, ...data }),
      ),
    },
    exercise: {
      findFirst: vi.fn().mockResolvedValue({ id: "ex1", contentPath: "content/tracks/go/concepts/01-x" }),
    },
    conceptState: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "cs1", state: "in_progress" }),
    },
  };
}

function makeFakeRedis() {
  const kv = new Map<string, string>();
  const streams = new Map<string, Array<[string, string[]]>>();
  return {
    kv,
    streams,
    setex: vi.fn(async (key: string, _ttl: number, value: string) => {
      kv.set(key, value);
      return "OK";
    }),
    get: vi.fn(async (key: string) => kv.get(key) ?? null),
    xrange: vi.fn(async (key: string) => streams.get(key) ?? []),
  };
}

function resultStream(exitCode: number, timedOut = false): Array<[string, string[]]> {
  return [
    ["1-1", ["type", "stdout", "data", "hello"]],
    ["1-2", ["type", "stderr", "data", "warning"]],
    ["1-3", ["type", "result", "exit_code", String(exitCode), "runtime_ms", "120", "timed_out", String(timedOut)]],
  ];
}

function makePipeline() {
  const db = makeMockDb();
  const redis = makeFakeRedis();
  const enqueue = vi.fn().mockResolvedValue("stream-token-1");
  const content = {
    getLessonTestFiles: vi.fn().mockReturnValue(["lesson test content"]),
    getTestoutTestFiles: vi.fn().mockReturnValue(["testout test content"]),
  };
  const mastery = { createMasteryEvent: vi.fn().mockResolvedValue({ id: "me1" }) };
  const state = { transition: vi.fn().mockResolvedValue({ id: "cs1", state: "mastered" }) };

  const pipeline = new SubmissionPipeline({
    db: db as never,
    redis: redis as never,
    enqueue,
    content: content as never,
    mastery: mastery as never,
    state: state as never,
  });

  return { pipeline, db, redis, enqueue, content, mastery, state };
}

const BEGIN_INPUT = {
  userId: "usr1",
  conceptId: "con1",
  enrollmentId: "enr1",
  code: "package main",
  language: "go",
  isSuite: true,
  kind: "lesson" as const,
};

describe("interpretResult — the single pass rule", () => {
  it("passes on exit 0 without timeout", () => {
    expect(interpretResult(0, false)).toBe(true);
  });

  it("fails on non-zero exit", () => {
    expect(interpretResult(1, false)).toBe(false);
  });

  it("fails on timeout even with exit 0", () => {
    expect(interpretResult(0, true)).toBe(false);
  });
});

describe("SubmissionPipeline.begin", () => {
  it("creates the submission, enqueues lesson tests, and binds the kind", async () => {
    const { pipeline, redis, enqueue, content } = makePipeline();

    const result = await pipeline.begin(BEGIN_INPUT);

    expect(result).toEqual({ submissionId: "sub1", streamToken: "stream-token-1" });
    expect(content.getLessonTestFiles).toHaveBeenCalledWith("content/tracks/go/concepts/01-x", "go");
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: "sub1", isSuite: true, testFiles: ["lesson test content"] }),
    );
    expect(JSON.parse(redis.kv.get("submission:meta:sub1")!)).toEqual({ kind: "lesson", enrollmentId: "enr1" });
  });

  it("loads testout tests for kind test_out", async () => {
    const { pipeline, enqueue, content } = makePipeline();

    await pipeline.begin({ ...BEGIN_INPUT, kind: "test_out" });

    expect(content.getTestoutTestFiles).toHaveBeenCalledWith("content/tracks/go/concepts/01-x", "go");
    expect(content.getLessonTestFiles).not.toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ testFiles: ["testout test content"] }),
    );
  });

  it("does not load tests for a plain run", async () => {
    const { pipeline, enqueue, content } = makePipeline();

    await pipeline.begin({ ...BEGIN_INPUT, isSuite: false });

    expect(content.getLessonTestFiles).not.toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({ testFiles: [] }));
  });
});

function primeFinalize(
  parts: ReturnType<typeof makePipeline>,
  opts: { kind: string; exitCode: number; timedOut?: boolean; enrollmentId?: string | null; isSuite?: boolean },
) {
  const { db, redis } = parts;
  db.submission.findUniqueOrThrow.mockResolvedValue({
    id: "sub1",
    userId: "usr1",
    conceptId: "con1",
    isSuite: opts.isSuite ?? true,
    passed: null,
  });
  redis.kv.set(
    "submission:meta:sub1",
    JSON.stringify({ kind: opts.kind, enrollmentId: opts.enrollmentId === undefined ? "enr1" : opts.enrollmentId }),
  );
  redis.streams.set("result:sub1", resultStream(opts.exitCode, opts.timedOut ?? false));
}

describe("SubmissionPipeline.finalize", () => {
  let parts: ReturnType<typeof makePipeline>;

  beforeEach(() => {
    parts = makePipeline();
  });

  it("scores server-side from the result stream and stores outputs", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0 });

    const result = await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(result.passed).toBe(true);
    expect(parts.db.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stdout: "hello", stderr: "warning", exitCode: 0, runtimeMs: 120, timedOut: false, passed: true }),
      }),
    );
  });

  it("lesson pass → mastery event achievedVia lesson", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0 });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.mastery.createMasteryEvent).toHaveBeenCalledWith(
      expect.objectContaining({ achievedVia: "lesson", enrollmentId: "enr1", conceptId: "con1" }),
    );
  });

  it("lesson fail → no state advance", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 1 });

    const result = await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(result.passed).toBe(false);
    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
    expect(parts.state.transition).not.toHaveBeenCalled();
  });

  it("plain lesson run (not a suite) records outputs but never advances state", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0, isSuite: false });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
  });

  it("test_out pass → mastery event achievedVia test_out", async () => {
    primeFinalize(parts, { kind: "test_out", exitCode: 0 });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.mastery.createMasteryEvent).toHaveBeenCalledWith(
      expect.objectContaining({ achievedVia: "test_out" }),
    );
  });

  it("test_out fail from available → in_progress, no penalty", async () => {
    primeFinalize(parts, { kind: "test_out", exitCode: 1 });
    parts.db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "available" });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
    expect(parts.state.transition).toHaveBeenCalledWith("enr1", "con1", "in_progress");
  });

  it("test_out fail when already in_progress → no transition", async () => {
    primeFinalize(parts, { kind: "test_out", exitCode: 1 });
    parts.db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "in_progress" });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.state.transition).not.toHaveBeenCalled();
  });

  it("placement pass → transition to mastered via placement (no lesson mastery event)", async () => {
    primeFinalize(parts, { kind: "placement", exitCode: 0 });
    parts.db.conceptState.findUniqueOrThrow.mockResolvedValue({ id: "cs1", state: "available" });

    await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(parts.state.transition).toHaveBeenCalledWith("enr1", "con1", "mastered", "placement");
    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
  });

  it("placement fail → concept left available", async () => {
    primeFinalize(parts, { kind: "placement", exitCode: 1 });

    const result = await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(result.passed).toBe(false);
    expect(parts.state.transition).not.toHaveBeenCalled();
  });

  it("is idempotent: a second finalize returns the stored verdict without re-advancing", async () => {
    parts.db.submission.findUniqueOrThrow.mockResolvedValue({
      id: "sub1",
      userId: "usr1",
      conceptId: "con1",
      isSuite: true,
      passed: true,
    });

    const result = await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(result.passed).toBe(true);
    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
    expect(parts.db.submission.update).not.toHaveBeenCalled();
  });

  it("rejects finalize by a different user", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0 });

    await expect(parts.pipeline.finalize({ submissionId: "sub1", userId: "someone-else" })).rejects.toThrow();
  });

  it("throws when the execution result is not yet in the stream", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0 });
    parts.redis.streams.set("result:sub1", [["1-1", ["type", "stdout", "data", "partial"]]]);

    await expect(parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" })).rejects.toThrow(/not available/i);
  });

  it("throws when the submission meta has expired", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0 });
    parts.redis.kv.delete("submission:meta:sub1");

    await expect(parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" })).rejects.toThrow(/meta/i);
  });

  it("records the result without advancing state when there is no enrollment", async () => {
    primeFinalize(parts, { kind: "lesson", exitCode: 0, enrollmentId: null });

    const result = await parts.pipeline.finalize({ submissionId: "sub1", userId: "usr1" });

    expect(result.passed).toBe(true);
    expect(parts.mastery.createMasteryEvent).not.toHaveBeenCalled();
  });
});
