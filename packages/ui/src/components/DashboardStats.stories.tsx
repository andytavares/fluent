import type { Meta, StoryObj } from "@storybook/react";
import { DashboardStats } from "./DashboardStats";

const meta: Meta<typeof DashboardStats> = {
  title: "Rosetta/DashboardStats",
  component: DashboardStats,
  args: {
    conceptsDone: 7,
    testedOut: 3,
    timeSavedMs: 4500000,
    capstoneProgress: 2,
  },
};
export default meta;

type Story = StoryObj<typeof DashboardStats>;

export const Default: Story = {};
export const Beginner: Story = {
  args: { conceptsDone: 1, testedOut: 0, timeSavedMs: 0, capstoneProgress: 0 },
};
export const AllComplete: Story = {
  args: { conceptsDone: 10, testedOut: 6, timeSavedMs: 12600000, capstoneProgress: 6 },
};
