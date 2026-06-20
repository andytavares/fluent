import type { PrismaClient } from "@prisma/client";
import { ConceptStateService } from "./concept-state.js";

type DB = PrismaClient;

const PLACEMENT_TASK_COUNT_MIN = 5;
const PLACEMENT_TASK_COUNT_MAX = 8;

export class PlacementService {
  private stateService: ConceptStateService;

  constructor(private db: DB) {
    this.stateService = new ConceptStateService(db);
  }

  async startPlacement(enrollmentId: string) {
    const enrollment = await this.db.enrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: { track: { include: { concepts: { where: { status: "published" }, orderBy: { position: "asc" } } } } },
    });

    const allConcepts = enrollment.track.concepts;
    const count = Math.min(
      Math.max(PLACEMENT_TASK_COUNT_MIN, Math.floor(allConcepts.length * 0.5)),
      PLACEMENT_TASK_COUNT_MAX,
    );

    return allConcepts.slice(0, count);
  }

  async scoreTask(enrollmentId: string, conceptId: string, passed: boolean) {
    if (!passed) {
      // fail → leave available (no transition)
      return { conceptId, result: "available" as const };
    }

    await this.stateService.transition(enrollmentId, conceptId, "mastered", "placement");
    return { conceptId, result: "mastered" as const };
  }

  async skipPlacement(enrollmentId: string) {
    // No-op: all concepts stay at their initialized states
    return { enrollmentId, skipped: true };
  }
}
