import type { Meta, StoryObj } from "@storybook/react";
import { LessonMarkdown } from "./LessonMarkdown";

const meta: Meta<typeof LessonMarkdown> = {
  title: "Rosetta/LessonMarkdown",
  component: LessonMarkdown,
};
export default meta;

type Story = StoryObj<typeof LessonMarkdown>;

export const Lesson: Story = {
  args: {
    children: [
      "## Functions",
      "A function takes **arguments** and returns a value. Call it with `Add(1, 2)`.",
      "- Name the function\n- List its parameters",
      "1. Write the signature\n2. Return the sum",
      "```go\nfunc Add(a, b int) int {\n\treturn a + b\n}\n```",
    ].join("\n\n"),
  },
};
