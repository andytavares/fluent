import type { Meta, StoryObj } from "@storybook/react";
import { OutputPane } from "./OutputPane";

const meta: Meta<typeof OutputPane> = {
  title: "Rosetta/OutputPane",
  component: OutputPane,
};
export default meta;

type Story = StoryObj<typeof OutputPane>;

export const Idle: Story = { args: { state: "idle", lines: [] } };
export const Streaming: Story = {
  args: {
    state: "streaming",
    lines: [
      { type: "stdout", data: "Running tests..." },
      { type: "stdout", data: "--- PASS: TestDouble (0.00s)" },
    ],
  },
};
export const Complete: Story = {
  args: {
    state: "complete",
    lines: [{ type: "stdout", data: "PASS" }],
    exitCode: 0,
    runtimeMs: 142,
  },
};
export const Error: Story = {
  args: {
    state: "error",
    lines: [{ type: "stderr", data: "./solution.go:4:2: undefined: fmt" }],
    exitCode: 1,
  },
};
export const Timeout: Story = { args: { state: "timeout", lines: [] } };
