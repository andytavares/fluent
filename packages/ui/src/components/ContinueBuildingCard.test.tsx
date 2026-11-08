import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ContinueBuildingCard } from "./ContinueBuildingCard";

describe("ContinueBuildingCard", () => {
  it("names the capstone and its step count when no session exists", () => {
    const html = renderToStaticMarkup(
      <ContinueBuildingCard capstoneTitle="Rust Key-Value Store" stepCount={6} />,
    );

    expect(html).toContain("Build the Rust Key-Value Store in 6 steps, against a live database.");
    expect(html).not.toContain("Go CRUD API");
  });

  it("names the current step, step count and capstone when a session exists", () => {
    const html = renderToStaticMarkup(
      <ContinueBuildingCard
        sessionId="session-abc123"
        currentStep={2}
        capstoneTitle="Rust Key-Value Store"
        stepCount={6}
      />,
    );

    expect(html).toContain("You are on step 2 of 6: Rust Key-Value Store.");
    expect(html).not.toContain("Go CRUD API");
  });
});
