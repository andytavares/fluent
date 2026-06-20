import type { PrismaClient, LearnerState, AchievedVia } from "@prisma/client";

type DB = PrismaClient;

export type ConceptStateTransition =
  | { from: "locked"; to: "available" }
  | { from: "available"; to: "in_progress" }
  | { from: "available"; to: "mastered"; achievedVia: "placement" }
  | { from: "in_progress"; to: "mastered"; achievedVia: "test_out" }
  | { from: "in_progress"; to: "completed"; achievedVia: "lesson" };

export function isValidTransition(from: LearnerState, to: LearnerState): boolean {
  const valid: Record<string, LearnerState[]> = {
    locked: ["available"],
    available: ["in_progress", "mastered"],
    in_progress: ["mastered", "completed"],
    mastered: [],
    completed: [],
  };
  return valid[from]?.includes(to) ?? false;
}

export class ConceptStateService {
  constructor(private db: DB) {}

  async transition(
    enrollmentId: string,
    conceptId: string,
    to: LearnerState,
    achievedVia?: AchievedVia,
  ) {
    const current = await this.db.conceptState.findUniqueOrThrow({
      where: { enrollmentId_conceptId: { enrollmentId, conceptId } },
    });

    if (!isValidTransition(current.state, to)) {
      throw new Error(`Invalid transition: ${current.state} → ${to}`);
    }

    const updated = await this.db.conceptState.update({
      where: { id: current.id },
      data: {
        state: to,
        achievedVia: achievedVia ?? null,
        openedAt: to === "in_progress" ? new Date() : current.openedAt,
        masteredAt:
          to === "mastered" || to === "completed" ? new Date() : current.masteredAt,
      },
    });

    // Unlock next concept in sequence if mastered/completed
    if (to === "mastered" || to === "completed") {
      await this.unlockNext(enrollmentId, conceptId);
    }

    return updated;
  }

  private async unlockNext(enrollmentId: string, conceptId: string) {
    const concept = await this.db.concept.findUniqueOrThrow({
      where: { id: conceptId },
    });
    const next = await this.db.concept.findFirst({
      where: { trackId: concept.trackId, position: concept.position + 1 },
    });
    if (!next) return;

    const nextState = await this.db.conceptState.findUnique({
      where: { enrollmentId_conceptId: { enrollmentId, conceptId: next.id } },
    });
    if (nextState?.state === "locked") {
      await this.db.conceptState.update({
        where: { id: nextState.id },
        data: { state: "available" },
      });
    }
  }
}
