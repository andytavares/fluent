import type { PrismaClient } from "@prisma/client";
import { ConceptStateService } from "./concept-state.js";

type DB = PrismaClient;

const TESTOUT_DURATION_MS = 4 * 60 * 1000; // 4 minutes

// Scoring test-out submissions lives in SubmissionPipeline (kind "test_out") —
// this service only starts the challenge (timer metadata + in_progress).
export class TestoutService {
  private stateService: ConceptStateService;

  constructor(private db: DB) {
    this.stateService = new ConceptStateService(db);
  }

  async startChallenge(enrollmentId: string, conceptId: string) {
    // Transition to in_progress if available
    const state = await this.db.conceptState.findUniqueOrThrow({
      where: { enrollmentId_conceptId: { enrollmentId, conceptId } },
    });

    if (state.state === "available") {
      await this.stateService.transition(enrollmentId, conceptId, "in_progress");
    }

    return {
      conceptId,
      durationMs: TESTOUT_DURATION_MS,
      startedAt: new Date().toISOString(),
    };
  }
}
