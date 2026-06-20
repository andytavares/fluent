import type { PrismaClient } from "@prisma/client";
import { ConceptStateService } from "./concept-state.js";

type DB = PrismaClient;

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

    return enrollment.track.concepts;
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
