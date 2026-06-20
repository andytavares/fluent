import type { Meta, StoryObj } from "@storybook/react";
import { CapstoneStepList } from "./CapstoneStepList";

const steps = [
  { stepNumber: 1, title: "Create the database schema", status: "completed" as const },
  { stepNumber: 2, title: "Implement the GET /items endpoint", status: "current" as const },
  { stepNumber: 3, title: "Implement POST /items endpoint", status: "locked" as const },
  { stepNumber: 4, title: "Add authentication middleware", status: "locked" as const },
  { stepNumber: 5, title: "Implement DELETE /items/:id", status: "locked" as const },
  { stepNumber: 6, title: "Add integration tests", status: "locked" as const },
];

const meta: Meta<typeof CapstoneStepList> = {
  title: "Rosetta/CapstoneStepList",
  component: CapstoneStepList,
  args: { steps, totalSteps: steps.length },
};
export default meta;

type Story = StoryObj<typeof CapstoneStepList>;

export const FirstStep: Story = {
  args: {
    steps: steps.map((s, i) => ({ ...s, status: i === 0 ? ("current" as const) : ("locked" as const) })),
  },
};
export const Midway: Story = {};
export const AllCompleted: Story = {
  args: {
    steps: steps.map((s) => ({ ...s, status: "completed" as const })),
  },
};
