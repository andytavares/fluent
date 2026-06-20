import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

type DB = PrismaClient;

export class CapstonePrereqService {
  constructor(private db: DB) {}

  async assertAllConceptsMastered(enrollmentId: string): Promise<void> {
    const states = await this.db.conceptState.findMany({
      where: {
        enrollmentId,
        concept: { status: "published" },
      },
      include: { concept: { select: { slug: true, title: true } } },
    });

    const unmet = states.filter(
      (cs) => cs.state !== "mastered" && cs.state !== "completed",
    );

    if (unmet.length > 0) {
      throw new TRPCError({
        code: "UNPROCESSABLE_CONTENT",
        message: "Not all concepts are mastered",
        cause: { unmet_concepts: unmet.map((cs) => ({ slug: cs.concept.slug, title: cs.concept.title, state: cs.state })) },
      });
    }
  }
}
