import type { Meta, StoryObj } from "@storybook/react";
import { ConceptNode } from "./ConceptNode";

const meta: Meta<typeof ConceptNode> = {
  title: "Rosetta/ConceptNode",
  component: ConceptNode,
  args: {
    concept: { slug: "goroutines", title: "Goroutines", position: 3 },
    state: "available",
  },
};
export default meta;

type Story = StoryObj<typeof ConceptNode>;

export const Locked: Story = { args: { state: "locked" } };
export const Available: Story = { args: { state: "available" } };
export const InProgress: Story = { args: { state: "in_progress" } };
export const Mastered: Story = { args: { state: "mastered", achievedVia: "lesson" } };
export const MasteredViaTestOut: Story = { args: { state: "mastered", achievedVia: "test_out" } };
export const MasteredViaPlacement: Story = { args: { state: "mastered", achievedVia: "placement" } };
export const Completed: Story = { args: { state: "completed" } };
