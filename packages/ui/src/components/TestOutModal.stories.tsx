import type { Meta, StoryObj } from "@storybook/react";
import { TestOutModal } from "./TestOutModal";

const meta: Meta<typeof TestOutModal> = {
  title: "Rosetta/TestOutModal",
  component: TestOutModal,
  args: {
    open: true,
    onClose: () => {},
    onEscape: () => {},
    concept: { title: "Goroutines", stub: "package main\n\nfunc main() {\n\t// TODO\n}\n" },
    onSubmit: async () => {},
  },
};
export default meta;

type Story = StoryObj<typeof TestOutModal>;

export const Open: Story = {};
export const Closed: Story = { args: { open: false } };
export const Submitting: Story = { args: { isSubmitting: true } };
