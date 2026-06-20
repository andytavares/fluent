import { describe, it, expect } from "vitest";
import { isValidTransition } from "../../src/service/concept-state.js";

describe("ConceptState transitions", () => {
  it("allows locked → available", () => {
    expect(isValidTransition("locked", "available")).toBe(true);
  });

  it("allows available → in_progress", () => {
    expect(isValidTransition("available", "in_progress")).toBe(true);
  });

  it("allows available → mastered (placement)", () => {
    expect(isValidTransition("available", "mastered")).toBe(true);
  });

  it("allows in_progress → mastered (test_out)", () => {
    expect(isValidTransition("in_progress", "mastered")).toBe(true);
  });

  it("allows in_progress → completed (lesson)", () => {
    expect(isValidTransition("in_progress", "completed")).toBe(true);
  });

  it("blocks locked → completed", () => {
    expect(isValidTransition("locked", "completed")).toBe(false);
  });

  it("blocks mastered → any", () => {
    expect(isValidTransition("mastered", "completed")).toBe(false);
    expect(isValidTransition("mastered", "in_progress")).toBe(false);
    expect(isValidTransition("mastered", "locked")).toBe(false);
  });

  it("blocks completed → any", () => {
    expect(isValidTransition("completed", "mastered")).toBe(false);
    expect(isValidTransition("completed", "available")).toBe(false);
  });

  it("blocks available → locked (backwards)", () => {
    expect(isValidTransition("available", "locked")).toBe(false);
  });
});
