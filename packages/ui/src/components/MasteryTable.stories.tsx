import type { Meta, StoryObj } from "@storybook/react";
import { MasteryTable } from "./MasteryTable";

const rows = [
  { conceptSlug: "variables", conceptTitle: "Variables & Types", state: "mastered" as const, achievedVia: "lesson" as const, bestRuntimeMs: 120, runCount: 8 },
  { conceptSlug: "functions", conceptTitle: "Functions", state: "mastered" as const, achievedVia: "test_out" as const, bestRuntimeMs: null, runCount: 0 },
  { conceptSlug: "structs", conceptTitle: "Structs & Interfaces", state: "mastered" as const, achievedVia: "placement" as const, bestRuntimeMs: null, runCount: 0 },
  { conceptSlug: "goroutines", conceptTitle: "Goroutines", state: "in_progress" as const, achievedVia: null, bestRuntimeMs: 450, runCount: 12 },
  { conceptSlug: "channels", conceptTitle: "Channels", state: "available" as const, achievedVia: null, bestRuntimeMs: null, runCount: 0 },
  { conceptSlug: "errors", conceptTitle: "Error Handling", state: "locked" as const, achievedVia: null, bestRuntimeMs: null, runCount: 0 },
];

const meta: Meta<typeof MasteryTable> = {
  title: "Rosetta/MasteryTable",
  component: MasteryTable,
  args: { rows },
};
export default meta;

type Story = StoryObj<typeof MasteryTable>;

export const Default: Story = {};
export const Empty: Story = { args: { rows: [] } };
