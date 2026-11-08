import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlacementTask } from "./PlacementTask";

const TASK_PROMPT = "Write **Add**:\n\n```go\nfunc Add(a, b int) int\n```";

function renderTask(): string {
  return renderToStaticMarkup(
    <PlacementTask
      concept={{ slug: "functions", title: "Functions" }}
      stub="package main"
      taskPrompt={TASK_PROMPT}
      onSubmit={() => {}}
      onSkip={() => {}}
      onTakeLesson={() => {}}
    />,
  );
}

describe("PlacementTask", () => {
  it("renders the task prompt as Markdown, not raw text", () => {
    const html = renderTask();
    expect(html).toContain("<pre>");
    expect(html).toContain("<strong>Add</strong>");
    expect(html).not.toContain("```");
    expect(html).not.toContain("**");
  });

  it("labels the skip button 'Go to the lessons'", () => {
    const html = renderTask();
    expect(html).toContain("Go to the lessons");
    expect(html).not.toContain("Skip this concept");
  });
});
