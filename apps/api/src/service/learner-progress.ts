import type { PrismaClient } from "@prisma/client";

type DB = PrismaClient;

// One definition of "what has this learner achieved". Dashboard, credential
// generation, and anything else that reports progress call this module
// instead of re-implementing the reductions over mastery/state rows.

export interface CapstoneProgress {
  sessionId: string;
  currentStep: number;
  stepsCompleted: number;
}

export interface EnrollmentProgress {
  conceptsDone: number;
  testedOut: number;
  timeSavedMs: number;
  capstone: CapstoneProgress | null;
}

interface ProgressRows {
  conceptStates: Array<{ state: string }>;
  masteryEvents: Array<{ achievedVia: string; lessonAvgTimeMs: number | null }>;
  activeSession: { id: string; currentStep: number; stepCompletions: Array<{ stepNumber: number }> } | null;
}

export function computeProgress({ conceptStates, masteryEvents, activeSession }: ProgressRows): EnrollmentProgress {
  const conceptsDone = conceptStates.filter(
    (cs) => cs.state === "mastered" || cs.state === "completed",
  ).length;

  const testedOut = masteryEvents.filter((me) => me.achievedVia === "test_out").length;

  const timeSavedMs = masteryEvents
    .filter((me) => me.achievedVia !== "lesson" && me.lessonAvgTimeMs)
    .reduce((sum, me) => sum + (me.lessonAvgTimeMs ?? 0), 0);

  const capstone = activeSession
    ? {
        sessionId: activeSession.id,
        currentStep: activeSession.currentStep,
        stepsCompleted: activeSession.stepCompletions.length,
      }
    : null;

  return { conceptsDone, testedOut, timeSavedMs, capstone };
}

const PROGRESS_INCLUDE = {
  conceptStates: true,
  masteryEvents: true,
  capstoneSessions: {
    where: { completedAt: null },
    include: { stepCompletions: { orderBy: { stepNumber: "asc" as const } } },
    take: 1,
    orderBy: { startedAt: "desc" as const },
  },
} as const;

export class LearnerProgressService {
  constructor(private db: DB) {}

  async forUser(userId: string) {
    const enrollments = await this.db.enrollment.findMany({
      where: { userId },
      include: { track: true, ...PROGRESS_INCLUDE },
    });

    return enrollments.map((enrollment) => ({
      enrollment,
      progress: computeProgress({
        conceptStates: enrollment.conceptStates,
        masteryEvents: enrollment.masteryEvents,
        activeSession: enrollment.capstoneSessions[0] ?? null,
      }),
    }));
  }

  async forEnrollment(enrollmentId: string): Promise<EnrollmentProgress> {
    const enrollment = await this.db.enrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: PROGRESS_INCLUDE,
    });

    return computeProgress({
      conceptStates: enrollment.conceptStates,
      masteryEvents: enrollment.masteryEvents,
      activeSession: enrollment.capstoneSessions[0] ?? null,
    });
  }
}
