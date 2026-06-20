import type { Meta, StoryObj } from "@storybook/react";
import { PlacementTask } from "./PlacementTask";

const meta: Meta<typeof PlacementTask> = {
  title: "Rosetta/PlacementTask",
  component: PlacementTask,
  args: {
    concept: { slug: "variables-and-types", title: "Variables and Types" },
    stub: "package main\n\nfunc Double(n int) int {\n\t// TODO\n}\n",
    onSubmit: async () => {},
    onSkip: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof PlacementTask>;

export const Default: Story = {};
export const Submitting: Story = { args: { isSubmitting: true } };
