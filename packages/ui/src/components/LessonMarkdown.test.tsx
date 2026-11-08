import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LessonMarkdown } from "./LessonMarkdown";

function renderMarkdown(markdown: string): string {
  return renderToStaticMarkup(<LessonMarkdown>{markdown}</LessonMarkdown>);
}

describe("LessonMarkdown", () => {
  it("renders a dash list as <ul> inside a wrapper that styles it with list-disc", () => {
    const html = renderMarkdown("- a\n- b");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>a</li>");
    expect(html).toContain("[&amp;_ul]:list-disc");
  });

  it("renders a numbered list as <ol> inside a wrapper that styles it with list-decimal", () => {
    const html = renderMarkdown("1. x");
    expect(html).toContain("<ol>");
    expect(html).toContain("[&amp;_ol]:list-decimal");
  });

  it("renders a go fence as <pre><code> without the literal fence", () => {
    const html = renderMarkdown("```go\nfmt.Println(1)\n```");
    expect(html).toMatch(/<pre><code[^>]*>fmt.Println\(1\)/);
    expect(html).not.toContain("```");
  });

  it("renders **bold** as <strong>", () => {
    expect(renderMarkdown("**bold**")).toContain("<strong>bold</strong>");
  });
});
