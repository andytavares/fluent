import type { Meta, StoryObj } from "@storybook/react";
import { SqlResultsGrid } from "./SqlResultsGrid";

const meta: Meta<typeof SqlResultsGrid> = {
  title: "Rosetta/SqlResultsGrid",
  component: SqlResultsGrid,
};
export default meta;

type Story = StoryObj<typeof SqlResultsGrid>;

export const NotRunYet: Story = { args: { result: null, isRunning: false } };
export const Running: Story = { args: { result: null, isRunning: true } };
export const Rows: Story = {
  args: {
    result: {
      kind: "rows",
      columns: ["id", "name", "email"],
      rows: [
        ["1", "Ada Lovelace", "ada@example.com"],
        ["2", "Grace Hopper", "grace@example.com"],
      ],
    },
    isRunning: false,
  },
};
export const EmptyRows: Story = {
  args: {
    result: { kind: "rows", columns: ["id", "name", "email"], rows: [] },
    isRunning: false,
  },
};
export const Message: Story = {
  args: { result: { kind: "message", message: "INSERT 0 1" }, isRunning: false },
};
export const ErrorResult: Story = {
  args: {
    result: { kind: "error", message: 'ERROR:  relation "usres" does not exist' },
    isRunning: false,
  },
};
