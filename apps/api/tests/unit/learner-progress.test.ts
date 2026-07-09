import { describe, it, expect, vi } from "vitest";
import { computeProgress, LearnerProgressService } from "../../src/service/learner-progress.js";

const conceptStates = [
  { state: "mastered" },
  { state: "completed" },
  { state: "in_progress" },
  { state: "locked" },
];

const masteryEvents = [
  { achievedVia: "test_out", lessonAvgTimeMs: 600_000 },
  { achievedVia: "placement", lessonAvgTimeMs: 480_000 },
  { achievedVia: "lesson", lessonAvgTimeMs: null },
  { achievedVia: "test_out", lessonAvgTimeMs: null }, // no snapshot → saves nothing
];

describe("computeProgress — the one definition of learner stats", () => {
  it("counts mastered and completed concepts as done", () => {
    const p = computeProgress({ conceptStates, masteryEvents: [], activeSession: null });
    expect(p.conceptsDone).toBe(2);
  });

  it("counts test_out mastery events", () => {
    const p = computeProgress({ conceptStates: [], masteryEvents, activeSession: null });
    expect(p.testedOut).toBe(2);
  });

  it("sums time saved from non-lesson events that carry a snapshot", () => {
    const p = computeProgress({ conceptStates: [], masteryEvents, activeSession: null });
    expect(p.timeSavedMs).toBe(600_000 + 480_000);
  });

  it("reports capstone progress from the active session", () => {
    const p = computeProgress({
      conceptStates: [],
      masteryEvents: [],
      activeSession: { id: "cap1", currentStep: 3, stepCompletions: [{ stepNumber: 1 }, { stepNumber: 2 }] },
    });
    expect(p.capstone).toEqual({ sessionId: "cap1", currentStep: 3, stepsCompleted: 2 });
  });

  it("reports null capstone when there is no active session", () => {
    const p = computeProgress({ conceptStates: [], masteryEvents: [], activeSession: null });
    expect(p.capstone).toBeNull();
  });
});

describe("LearnerProgressService", () => {
  it("forUser loads each enrollment with track and computes its progress", async () => {
    const enrollment = {
      id: "enr1",
      track: { id: "trk1", slug: "go" },
      conceptStates: [{ state: "mastered" }],
      masteryEvents: [{ achievedVia: "test_out", lessonAvgTimeMs: 300_000 }],
      capstoneSessions: [{ id: "cap1", currentStep: 2, stepCompletions: [{ stepNumber: 1 }] }],
    };
    const db = { enrollment: { findMany: vi.fn().mockResolvedValue([enrollment]) } };
    const service = new LearnerProgressService(db as never);

    const result = await service.forUser("usr1");

    expect(result).toHaveLength(1);
    expect(result[0]!.enrollment.id).toBe("enr1");
    expect(result[0]!.progress).toEqual({
      conceptsDone: 1,
      testedOut: 1,
      timeSavedMs: 300_000,
      capstone: { sessionId: "cap1", currentStep: 2, stepsCompleted: 1 },
    });
  });

  it("forEnrollment computes progress for a single enrollment", async () => {
    const db = {
      enrollment: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: "enr1",
          conceptStates: [{ state: "completed" }, { state: "available" }],
          masteryEvents: [],
          capstoneSessions: [],
        }),
      },
    };
    const service = new LearnerProgressService(db as never);

    const progress = await service.forEnrollment("enr1");

    expect(progress.conceptsDone).toBe(1);
    expect(progress.testedOut).toBe(0);
    expect(progress.capstone).toBeNull();
  });
});
