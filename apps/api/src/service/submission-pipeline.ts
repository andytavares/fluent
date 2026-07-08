import type { PrismaClient, SubmissionKind } from "@prisma/client";
import type { ContentStore } from "@fluent/content-config";
import { resultStreamKey, parseResultStream } from "@fluent/execution-contract";
import type { CodeExecutionJob } from "../queue/queues.js";
import { MasteryService } from "./mastery.js";
import { ConceptStateService } from "./concept-state.js";

export type { SubmissionKind };

/**
 * The single pass rule. Every flow — lesson, test-out, placement — scores a
 * run through this function, server-side, from the sandbox worker's result.
 */
export function interpretResult(exitCode: number, timedOut: boolean): boolean {
  return exitCode === 0 && !timedOut;
}

/** Thrown when a user finalizes a submission they don't own. */
export class SubmissionAccessError extends Error {}

/** Thrown when the worker's result isn't in Redis yet. */
export class ResultNotReadyError extends Error {}

/** Thrown when the requested kind isn't valid for the concept (e.g. test_out without hasTestout). */
export class InvalidSubmissionKindError extends Error {}

interface RedisLike {
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

/**
 * Owns a submission end to end: enqueue with the right test files for the
 * flow, bind the flow kind on the submission row, and — once the sandbox
 * worker has written its result stream — score the run and advance the
 * learner's concept state.
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
    if (input.kind === "test_out") {
      const concept = await this.db.concept.findUniqueOrThrow({
        where: { id: input.conceptId },
        select: { hasTestout: true },
      });
      if (!concept.hasTestout) {
        throw new InvalidSubmissionKindError("This concept has no test-out challenge");
      }
    }

    const submission = await this.db.submission.create({
      data: {
        userId: input.userId,
        conceptId: input.conceptId,
        exerciseId: input.exerciseId ?? null,
        enrollmentId: input.enrollmentId ?? null,
        kind: input.kind,
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
        if (input.kind === "test_out") {
          testFiles = this.content.getTestoutTestFiles(exercise.contentPath, input.language);
          // Concepts without dedicated testout tests are graded against the
          // lesson suite — an empty suite would trivially exit 0 and award
          // mastery for unvalidated code.
          if (testFiles.length === 0) {
            testFiles = this.content.getLessonTestFiles(exercise.contentPath, input.language);
          }
        } else {
          testFiles = this.content.getLessonTestFiles(exercise.contentPath, input.language);
        }
      }
    }

    let streamToken: string;
    try {
      streamToken = await this.enqueueJob({
        jobId: submission.id,
        userId: input.userId,
        conceptId: input.conceptId,
        ...(input.exerciseId ? { exerciseId: input.exerciseId } : {}),
        code: input.code,
        language: input.language,
        isSuite: input.isSuite,
        testFiles,
      });
    } catch (err) {
      // Enqueue refused (e.g. rate limit) — don't leave an orphan row that
      // can never be finalized.
      await this.db.submission.delete({ where: { id: submission.id } });
      throw err;
    }

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

    const parsed = parseResultStream(await this.redis.xrange(resultStreamKey(submissionId), "-", "+"));
    if (!parsed.result) {
      throw new ResultNotReadyError("Execution result not available yet");
    }
    const passed = interpretResult(parsed.result.exitCode, parsed.result.timedOut);

    const updated = await this.db.submission.update({
      where: { id: submissionId },
      data: {
        stdout: parsed.stdout.length > 0 ? parsed.stdout.join("\n") : null,
        stderr: parsed.stderr.length > 0 ? parsed.stderr.join("\n") : null,
        exitCode: parsed.result.exitCode,
        runtimeMs: parsed.result.runtimeMs,
        timedOut: parsed.result.timedOut,
        passed,
      },
    });

    if (submission.isSuite && submission.enrollmentId) {
      await this.advanceState(submission.kind, submission.enrollmentId, submission.conceptId, userId, passed);
    }

    return { submission: updated, passed };
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
