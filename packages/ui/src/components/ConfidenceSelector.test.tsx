import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfidenceSelector } from "./ConfidenceSelector";

describe("ConfidenceSelector", () => {
  it("describes every option without the word language, since some tracks are tools", () => {
    const html = renderToStaticMarkup(<ConfidenceSelector value={null} onChange={() => {}} />);

    expect(html).toContain("I am new to this.");
    expect(html.toLowerCase()).not.toContain("language");
  });
});
