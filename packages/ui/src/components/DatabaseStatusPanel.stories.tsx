import type { Meta, StoryObj } from "@storybook/react";
import { DatabaseStatusPanel } from "./DatabaseStatusPanel";

const meta: Meta<typeof DatabaseStatusPanel> = {
  title: "Rosetta/DatabaseStatusPanel",
  component: DatabaseStatusPanel,
};
export default meta;

type Story = StoryObj<typeof DatabaseStatusPanel>;

export const Provisioning: Story = { args: { status: "provisioning" } };
export const Connected: Story = {
  args: {
    status: "connected",
    expiresAt: new Date(Date.now() + 25 * 60 * 1000),
  },
};
export const Error: Story = { args: { status: "error" } };
export const Expired: Story = { args: { status: "expired" } };
