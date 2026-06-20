import type { PrismaClient } from "@prisma/client";
import { MasteryService } from "./mastery.js";
import { ConceptStateService } from "./concept-state.js";

type DB = PrismaClient;

const TESTOUT_DURATION_MS = 4 * 60 * 1000; // 4 minutes

interface SubmitInput {
  enrollmentId: string;
  conceptId: string;
  userId: string;
  code: string;
  timerExpired: boolean;
}

export class TestoutService {
  private masteryService: MasteryService;
  private stateService: ConceptStateService;

  constructor(private db: DB) {
    this.masteryService = new MasteryService(db);
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

  async submitChallenge(input: SubmitInput) {
    if (input.timerExpired) {
      // Timer expired → in_progress (no penalty)
      await this.stateService.transition(input.enrollmentId, input.conceptId, "in_progress");
      return { result: "timer_expired" as const, conceptState: "in_progress" };
    }

    // Actual code evaluation happens via BullMQ/Judge0 (async)
    // This returns pending; the worker updates the result
    return { result: "pending" as const, conceptState: "in_progress" };
  }

  async applyTestoutResult(
    enrollmentId: string,
    conceptId: string,
    userId: string,
    passed: boolean,
  ) {
    if (passed) {
      await this.masteryService.createMasteryEvent({
        enrollmentId,
        conceptId,
        userId,
        achievedVia: "test_out",
      });
      return { conceptState: "mastered" };
    } else {
      // Fail → in_progress with no penalty
      const state = await this.db.conceptState.findUniqueOrThrow({
        where: { enrollmentId_conceptId: { enrollmentId, conceptId } },
      });
      if (state.state === "available") {
        await this.stateService.transition(enrollmentId, conceptId, "in_progress");
      }
      return { conceptState: "in_progress" };
    }
  }
}
