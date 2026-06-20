import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

type DB = PrismaClient;

export class CredentialService {
  constructor(private db: DB) {}

  async generateCredential(userId: string, trackSlug: string) {
    const track = await this.db.track.findUniqueOrThrow({
      where: { slug: trackSlug },
      include: { concepts: { where: { status: "published" } } },
    });

    const enrollment = await this.db.enrollment.findUniqueOrThrow({
      where: { userId_trackId: { userId, trackId: track.id } },
      include: { masteryEvents: true, user: { select: { name: true } } },
    });

    const testedOutCount = enrollment.masteryEvents.filter(
      (me) => me.achievedVia === "test_out",
    ).length;

    const token = randomBytes(32).toString("base64url");

    const summary = {
      name: enrollment.user.name ?? "Learner",
      track_title: track.title,
      completed_at: enrollment.completedAt?.toISOString() ?? new Date().toISOString(),
      tested_out_count: testedOutCount,
      concepts_total: track.concepts.length,
    };

    return this.db.credential.create({
      data: { userId, trackId: track.id, token, summary },
    });
  }

  async getByToken(token: string) {
    return this.db.credential.findUniqueOrThrow({
      where: { token },
      include: { user: { select: { name: true } }, track: { select: { title: true, slug: true } } },
    });
  }
}
