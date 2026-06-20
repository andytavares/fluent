import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Rosetta/Button",
  component: Button,
  args: { children: "Button" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Small: Story = { args: { variant: "primary", size: "sm", children: "Small" } };
export const Large: Story = { args: { variant: "primary", size: "lg", children: "Large" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
export const Loading: Story = { args: { variant: "primary", disabled: true, children: "Loading…" } };
