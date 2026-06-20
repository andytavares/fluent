import { describe, it, expect } from "vitest";

// Pure dashboard aggregation logic
interface MasteryEvent {
  achievedVia: "placement" | "test_out" | "lesson";
  lessonAvgTimeMs: number | null;
}

interface ConceptState {
  state: "locked" | "available" | "in_progress" | "mastered" | "completed";
}

function aggregateDashboardStats(
  conceptStates: ConceptState[],
  masteryEvents: MasteryEvent[],
  capstoneStepsCompleted: number,
) {
  const conceptsDone = conceptStates.filter(
    (cs) => cs.state === "mastered" || cs.state === "completed",
  ).length;

  const testedOut = masteryEvents.filter((me) => me.achievedVia === "test_out").length;

  const timeSavedMs = masteryEvents
    .filter((me) => me.achievedVia !== "lesson" && me.lessonAvgTimeMs !== null)
    .reduce((sum, me) => sum + (me.lessonAvgTimeMs ?? 0), 0);

  return { conceptsDone, testedOut, timeSavedMs, capstoneProgress: capstoneStepsCompleted };
}

describe("Dashboard aggregation", () => {
  it("counts mastered + completed concepts as done", () => {
    const states: ConceptState[] = [
      { state: "mastered" },
      { state: "completed" },
      { state: "in_progress" },
      { state: "locked" },
    ];
    const result = aggregateDashboardStats(states, [], 0);
    expect(result.conceptsDone).toBe(2);
  });

  it("counts test_out events", () => {
    const events: MasteryEvent[] = [
      { achievedVia: "test_out", lessonAvgTimeMs: 300_000 },
      { achievedVia: "lesson", lessonAvgTimeMs: null },
    ];
    const result = aggregateDashboardStats([], events, 0);
    expect(result.testedOut).toBe(1);
  });

  it("sums time saved from test_out + placement events", () => {
    const events: MasteryEvent[] = [
      { achievedVia: "test_out", lessonAvgTimeMs: 300_000 },
      { achievedVia: "placement", lessonAvgTimeMs: 600_000 },
      { achievedVia: "lesson", lessonAvgTimeMs: 400_000 },
    ];
    const result = aggregateDashboardStats([], events, 0);
    expect(result.timeSavedMs).toBe(900_000);
  });

  it("tracks capstone progress", () => {
    const result = aggregateDashboardStats([], [], 3);
    expect(result.capstoneProgress).toBe(3);
  });
});
