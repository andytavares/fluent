import { randomUUID } from "node:crypto";

// Integration tests exercise the shipping tRPC routers against the real
// database and Redis (run with INTEGRATION=true and docker-compose up).
// Everything is loaded lazily so skipped suites never open connections —
// importing the router module eagerly would connect to Redis/BullMQ.

export const INTEGRATION = process.env["INTEGRATION"] === "true";

export async function loadEnv() {
  const { prisma } = await import("../../src/db/index.js");
  const { redis } = await import("../../src/db/redis.js");
  const { appRouter } = await import("../../src/router/index.js");
  const { resultStreamKey } = await import("@fluent/execution-contract");

  function caller(userId: string) {
    return appRouter.createCaller({
      req: {} as never,
      res: {} as never,
      db: prisma,
      session: {
        user: { id: userId, email: "it@test.local" },
        expires: new Date(Date.now() + 86_400_000).toISOString(),
      } as never,
    });
  }

  /**
   * Seeds a learner enrolled in a fresh track through the shipping
   * createEnrollment mutation (first concept available, rest locked).
   */
  async function seedLearner(opts: { concepts?: number; lessonAvgTimeMs?: number | null } = {}) {
    const n = opts.concepts ?? 2;
    const uid = randomUUID().slice(0, 8);

    const user = await prisma.user.create({
      data: { email: `it-${uid}@test.local`, name: "Integration Tester" },
    });
    const track = await prisma.track.create({
      data: {
        slug: `it-track-${uid}`,
        title: "Integration Track",
        description: "integration test track",
        language: "go",
        status: "published",
      },
    });

    const concepts = [];
    for (let i = 1; i <= n; i++) {
      const concept = await prisma.concept.create({
        data: {
          trackId: track.id,
          slug: `it-c${i}-${uid}`,
          title: `Concept ${i}`,
          position: i,
          status: "published",
          hasTestout: true,
          lessonAvgTimeMs: opts.lessonAvgTimeMs ?? null,
        },
      });
      await prisma.exercise.create({
        data: { conceptId: concept.id, type: "lesson", contentPath: `content/it-none-${uid}` },
      });
      concepts.push(concept);
    }

    const enrollment = await caller(user.id).enrollments.createEnrollment({ trackId: track.id });
    return { user, track, concepts, enrollment };
  }

  /** Plays the sandbox worker's part: writes the result stream the pipeline finalizes from. */
  async function writeWorkerResult(
    submissionId: string,
    opts: { exitCode: number; stdout?: string; stderr?: string; timedOut?: boolean },
  ) {
    const key = resultStreamKey(submissionId);
    if (opts.stdout) await redis.xadd(key, "*", "type", "stdout", "data", opts.stdout);
    if (opts.stderr) await redis.xadd(key, "*", "type", "stderr", "data", opts.stderr);
    await redis.xadd(
      key, "*",
      "type", "result",
      "exit_code", String(opts.exitCode),
      "runtime_ms", "42",
      "timed_out", String(opts.timedOut ?? false),
    );
  }

  async function conceptState(enrollmentId: string, conceptId: string) {
    return prisma.conceptState.findUniqueOrThrow({
      where: { enrollmentId_conceptId: { enrollmentId, conceptId } },
    });
  }

  async function close() {
    await prisma.$disconnect();
    redis.disconnect();
  }

  return { db: prisma, redis, caller, seedLearner, writeWorkerResult, conceptState, close };
}

export type Env = Awaited<ReturnType<typeof loadEnv>>;
