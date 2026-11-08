import type { ReactNode } from "react";
import type * as Dialog from "@radix-ui/react-dialog";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TestOutModal } from "./TestOutModal";

// Radix mounts the portal only after an effect, so server markup would be empty.
vi.mock("@radix-ui/react-dialog", async (importOriginal) => ({
  ...(await importOriginal<typeof Dialog>()),
  Portal: ({ children }: { children: ReactNode }) => children,
}));

const TASK_PROMPT = "Write **Add**:\n\n```go\nfunc Add(a, b int) int\n```";

function renderModal(): string {
  return renderToStaticMarkup(
    <TestOutModal
      open
      onClose={() => {}}
      concept={{ title: "Functions", stub: "package main", taskPrompt: TASK_PROMPT }}
      onSubmit={() => {}}
      onEscape={() => {}}
    />,
  );
}

describe("TestOutModal", () => {
  it("renders the task prompt as Markdown, not raw text", () => {
    const html = renderModal();
    expect(html).toContain("<pre>");
    expect(html).toContain("<strong>Add</strong>");
    expect(html).not.toContain("```");
    expect(html).not.toContain("**");
  });

  it("offers 'Take the lesson' beside Submit on the task view", () => {
    const html = renderModal();
    expect(html).toContain("Take the lesson");
    expect(html).not.toContain("rather do the lesson");
  });
});
