import type { Meta, StoryObj } from "@storybook/react";
import { VerificationChecklist } from "./VerificationChecklist";

const allPass = [
  { method: "GET", path: "/health", status: 200, passed: true },
  { method: "POST", path: "/users", status: 201, passed: true },
  { method: "GET", path: "/users/1", status: 200, passed: true },
];

const someFail = [
  { method: "GET", path: "/health", status: 200, passed: true },
  { method: "POST", path: "/users", status: 500, passed: false },
  { method: "GET", path: "/users/1", status: 404, passed: false },
];

const meta: Meta<typeof VerificationChecklist> = {
  title: "Rosetta/VerificationChecklist",
  component: VerificationChecklist,
};
export default meta;

type Story = StoryObj<typeof VerificationChecklist>;

export const NotRunYet: Story = { args: { results: null, isVerifying: false } };
export const Verifying: Story = { args: { results: null, isVerifying: true } };
export const AllPassed: Story = { args: { results: allPass, isVerifying: false } };
export const SomeFailed: Story = { args: { results: someFail, isVerifying: false } };
