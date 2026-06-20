import type { PrismaClient } from "@prisma/client";

type DB = PrismaClient;

export class StreakService {
  constructor(private db: DB) {}

  async updateStreak(userId: string): Promise<void> {
    // Streak = consecutive calendar days (UTC) with ≥1 submission
    // This method is called after every submission; the streak computation
    // is derived at read time from submission history, no separate streak table needed in v1.
    // Placeholder: streak is computed in getDashboard from submission dates.
    void userId;
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const submissions = await this.db.submission.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (submissions.length === 0) return 0;

    const days = new Set(
      submissions.map((s) => s.createdAt.toISOString().split("T")[0]),
    );
    const sortedDays = [...days].sort().reverse();

    const today = new Date().toISOString().split("T")[0]!;
    let streak = 0;
    let expected = today;

    for (const day of sortedDays) {
      if (day === expected) {
        streak++;
        const d = new Date(expected);
        d.setUTCDate(d.getUTCDate() - 1);
        expected = d.toISOString().split("T")[0]!;
      } else {
        break;
      }
    }

    return streak;
  }
}
