import type { Meta, StoryObj } from "@storybook/react";
import { ConfidenceSelector } from "./ConfidenceSelector";

const meta: Meta<typeof ConfidenceSelector> = {
  title: "Rosetta/ConfidenceSelector",
  component: ConfidenceSelector,
  args: { value: null, onChange: () => {} },
};
export default meta;

type Story = StoryObj<typeof ConfidenceSelector>;

export const Default: Story = {};
export const Beginner: Story = { args: { value: "beginner" } };
export const Some: Story = { args: { value: "some" } };
export const Experienced: Story = { args: { value: "experienced" } };
