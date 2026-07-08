import type { PrismaClient } from "@prisma/client";
import type { ContentStore } from "@fluent/content-config";
import { resultStreamKey } from "@fluent/execution-contract";
import type { CodeExecutionJob } from "../queue/queues.js";
import { MasteryService } from "./mastery.js";
import { ConceptStateService } from "./concept-state.js";

export type SubmissionKind = "lesson" | "test_out" | "placement";

/**
 * The single pass rule. Every flow — lesson, test-out, placement — scores a
 * run through this function, server-side, from the sandbox worker's result.
 */
export function interpretResult(exitCode: number, timedOut: boolean): boolean {
  return exitCode === 0 && !timedOut;
}

const META_TTL_SECONDS = 3600;

/** Thrown when a user finalizes a submission they don't own. */
export class SubmissionAccessError extends Error {}

/** Thrown when the worker's result (or the submission meta) isn't in Redis yet. */
export class ResultNotReadyError extends Error {}

interface RedisLike {
  setex(key: string, seconds: number, value: string): Promise<unknown>;
  get(key: string): Promise<string | null>;
  xrange(key: string, start: string, end: string): Promise<Array<[string, string[]]>>;
}

interface PipelineDeps {
  db: PrismaClient;
  redis: RedisLike;
  /** Enqueue a job for the sandbox worker; returns the SSE stream token. */
  enqueue: (job: CodeExecutionJob) => Promise<string>;
  content: Pick<ContentStore, "getLessonTestFiles" | "getTestoutTestFiles">;
  /** Internal seams — injectable for tests, real services by default. */
  mastery?: Pick<MasteryService, "createMasteryEvent">;
  state?: Pick<ConceptStateService, "transition">;
}

export interface BeginInput {
  userId: string;
  conceptId: string;
  enrollmentId?: string;
  exerciseId?: string;
  code: string;
  language: string;
  isSuite: boolean;
  kind: SubmissionKind;
}

interface SubmissionMeta {
  kind: SubmissionKind;
  enrollmentId: string | null;
}

interface StreamResult {
  stdout: string | null;
  stderr: string | null;
  exitCode: number;
  runtimeMs: number;
  timedOut: boolean;
}

/**
 * Owns a submission end to end: enqueue with the right test files for the
 * flow, bind the flow kind, and — once the sandbox worker has written its
 * result stream — score the run and advance the learner's concept state.
 *
 * The web client never decides pass/fail; it only relays the submission id.
 */
export class SubmissionPipeline {
  private db: PrismaClient;
  private redis: RedisLike;
  private enqueueJob: (job: CodeExecutionJob) => Promise<string>;
  private content: Pick<ContentStore, "getLessonTestFiles" | "getTestoutTestFiles">;
  private mastery: Pick<MasteryService, "createMasteryEvent">;
  private state: Pick<ConceptStateService, "transition">;

  constructor(deps: PipelineDeps) {
    this.db = deps.db;
    this.redis = deps.redis;
    this.enqueueJob = deps.enqueue;
    this.content = deps.content;
    this.mastery = deps.mastery ?? new MasteryService(deps.db);
    this.state = deps.state ?? new ConceptStateService(deps.db);
  }

  async begin(input: BeginInput): Promise<{ submissionId: string; streamToken: string }> {
    const submission = await this.db.submission.create({
      data: {
        userId: input.userId,
        conceptId: input.conceptId,
        exerciseId: input.exerciseId ?? null,
        code: input.code,
        language: input.language,
        isSuite: input.isSuite,
      },
    });

    let testFiles: string[] = [];
    if (input.isSuite) {
      const exercise = await this.db.exercise.findFirst({
        where: { conceptId: input.conceptId, type: "lesson" },
      });
      if (exercise?.contentPath) {
        testFiles =
          input.kind === "test_out"
            ? this.content.getTestoutTestFiles(exercise.contentPath, input.language)
            : this.content.getLessonTestFiles(exercise.contentPath, input.language);
      }
    }

    const streamToken = await this.enqueueJob({
      jobId: submission.id,
      userId: input.userId,
      conceptId: input.conceptId,
      ...(input.exerciseId ? { exerciseId: input.exerciseId } : {}),
      code: input.code,
      language: input.language,
      isSuite: input.isSuite,
      testFiles,
    });

    const meta: SubmissionMeta = { kind: input.kind, enrollmentId: input.enrollmentId ?? null };
    await this.redis.setex(`submission:meta:${submission.id}`, META_TTL_SECONDS, JSON.stringify(meta));

    return { submissionId: submission.id, streamToken };
  }

  async finalize({ submissionId, userId }: { submissionId: string; userId: string }) {
    const submission = await this.db.submission.findUniqueOrThrow({
      where: { id: submissionId },
    });
    if (submission.userId !== userId) {
      throw new SubmissionAccessError("Submission does not belong to this user");
    }

    // Already finalized — return the stored verdict, never advance twice.
    if (submission.passed !== null) {
      return { submission, passed: submission.passed };
    }

    const metaRaw = await this.redis.get(`submission:meta:${submissionId}`);
    if (!metaRaw) {
      throw new ResultNotReadyError("Submission meta expired or missing — cannot finalize");
    }
    const meta = JSON.parse(metaRaw) as SubmissionMeta;

    const result = await this.readResultStream(submissionId);
    const passed = interpretResult(result.exitCode, result.timedOut);

    const updated = await this.db.submission.update({
      where: { id: submissionId },
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        runtimeMs: result.runtimeMs,
        timedOut: result.timedOut,
        passed,
      },
    });

    if (submission.isSuite && meta.enrollmentId) {
      await this.advanceState(meta.kind, meta.enrollmentId, submission.conceptId, userId, passed);
    }

    return { submission: updated, passed };
  }

  private async readResultStream(submissionId: string): Promise<StreamResult> {
    const entries = await this.redis.xrange(resultStreamKey(submissionId), "-", "+");

    const stdout: string[] = [];
    const stderr: string[] = [];
    let result: StreamResult | null = null;

    for (const [, fields] of entries) {
      const obj: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        obj[fields[i]!] = fields[i + 1]!;
      }
      if (obj["type"] === "stdout" && obj["data"]) stdout.push(obj["data"]);
      if (obj["type"] === "stderr" && obj["data"]) stderr.push(obj["data"]);
      if (obj["type"] === "result") {
        result = {
          stdout: null,
          stderr: null,
          exitCode: parseInt(obj["exit_code"] ?? "-1", 10),
          runtimeMs: parseInt(obj["runtime_ms"] ?? "0", 10),
          timedOut: obj["timed_out"] === "true",
        };
      }
    }

    if (!result) {
      throw new ResultNotReadyError("Execution result not available yet");
    }

    result.stdout = stdout.length > 0 ? stdout.join("\n") : null;
    result.stderr = stderr.length > 0 ? stderr.join("\n") : null;
    return result;
  }

  private async advanceState(
    kind: SubmissionKind,
    enrollmentId: string,
    conceptId: string,
    userId: string,
    passed: boolean,
  ): Promise<void> {
    if (kind === "placement") {
      // Fail → leave available (no penalty, learner takes the lesson).
      if (passed) {
        await this.state.transition(enrollmentId, conceptId, "mastered", "placement");
      }
      return;
    }

    if (kind === "test_out") {
      if (passed) {
        await this.mastery.createMasteryEvent({ enrollmentId, conceptId, userId, achievedVia: "test_out" });
      } else {
        // Fail → in_progress with no penalty; guard against re-transition.
        const current = await this.db.conceptState.findUniqueOrThrow({
          where: { enrollmentId_conceptId: { enrollmentId, conceptId } },
        });
        if (current.state === "available") {
          await this.state.transition(enrollmentId, conceptId, "in_progress");
        }
      }
      return;
    }

    // Lesson: only a passing suite advances the concept.
    if (passed) {
      await this.mastery.createMasteryEvent({ enrollmentId, conceptId, userId, achievedVia: "lesson" });
    }
  }
}
