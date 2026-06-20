import type { PrismaClient, AchievedVia } from "@prisma/client";
import { ConceptStateService } from "./concept-state.js";

type DB = PrismaClient;

interface MasteryEventInput {
  enrollmentId: string;
  conceptId: string;
  userId: string;
  achievedVia: AchievedVia;
}

export class MasteryService {
  private stateService: ConceptStateService;

  constructor(private db: DB) {
    this.stateService = new ConceptStateService(db);
  }

  async createMasteryEvent(input: MasteryEventInput) {
    const concept = await this.db.concept.findUniqueOrThrow({
      where: { id: input.conceptId },
      select: { lessonAvgTimeMs: true },
    });

    const newState = input.achievedVia === "lesson" ? ("completed" as const) : ("mastered" as const);

    const currentState = await this.db.conceptState.findUnique({
      where: { enrollmentId_conceptId: { enrollmentId: input.enrollmentId, conceptId: input.conceptId } },
      select: { state: true },
    });

    // Skip transition if already in a terminal state (mastered/completed)
    const terminalStates = ["mastered", "completed"];
    if (!currentState || !terminalStates.includes(currentState.state)) {
      await this.stateService.transition(
        input.enrollmentId,
        input.conceptId,
        newState,
        input.achievedVia,
      );
    }

    // Snapshot lessonAvgTimeMs at event creation time for "time saved" metric
    // Only meaningful for test_out/placement (those are the ones saving time)
    const lessonAvgTimeMs =
      input.achievedVia !== "lesson" ? concept.lessonAvgTimeMs : null;

    return this.db.masteryEvent.create({
      data: {
        enrollmentId: input.enrollmentId,
        conceptId: input.conceptId,
        userId: input.userId,
        achievedVia: input.achievedVia,
        lessonAvgTimeMs,
      },
    });
  }
}
