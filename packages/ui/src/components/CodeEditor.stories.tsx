import type { Meta, StoryObj } from "@storybook/react";
import { CodeEditor } from "./CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Rosetta/CodeEditor",
  component: CodeEditor,
  args: {
    value: `package main\n\nfunc main() {\n\t// Write your solution here\n}\n`,
    onChange: () => {},
    onRun: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Empty: Story = { args: { value: "" } };
export const WithStub: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
