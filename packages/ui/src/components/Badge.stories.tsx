import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Rosetta/Badge",
  component: Badge,
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Locked: Story = { args: { variant: "locked" } };
export const Available: Story = { args: { variant: "available" } };
export const InProgress: Story = { args: { variant: "in_progress" } };
export const Mastered: Story = { args: { variant: "mastered" } };
export const Completed: Story = { args: { variant: "completed" } };
