import type { Meta, StoryObj } from "@storybook/react";
import { ContinueBuildingCard } from "./ContinueBuildingCard";

const meta: Meta<typeof ContinueBuildingCard> = {
  title: "Rosetta/ContinueBuildingCard",
  component: ContinueBuildingCard,
  args: {
    onResume: () => {},
    onStart: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof ContinueBuildingCard>;

export const NoSession: Story = {};
export const ActiveSession: Story = {
  args: {
    sessionId: "session-abc123",
    currentStep: 2,
    trackSlug: "go",
  },
};
