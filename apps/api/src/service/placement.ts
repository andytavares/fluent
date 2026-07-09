import type { PrismaClient } from "@prisma/client";

type DB = PrismaClient;

// Scoring placement tasks lives in SubmissionPipeline (kind "placement") —
// this service only assembles the placement task list.
export class PlacementService {
  constructor(private db: DB) {}

  async startPlacement(enrollmentId: string) {
    const enrollment = await this.db.enrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: { track: { include: { concepts: { where: { status: "published" }, orderBy: { position: "asc" } } } } },
    });

    return enrollment.track.concepts;
  }

  async skipPlacement(enrollmentId: string) {
    // No-op: all concepts stay at their initialized states
    return { enrollmentId, skipped: true };
  }
}
