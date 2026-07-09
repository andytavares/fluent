import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const tabs = [
  { id: "code", label: "Code" },
  { id: "database", label: "Database" },
];

function TabsDemo() {
  const [activeTab, setActiveTab] = useState("code");
  return (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-4 text-sm text-[var(--color-text-primary)]">
        {activeTab === "code" ? "Code panel content" : "Database panel content"}
      </div>
    </Tabs>
  );
}

const meta: Meta<typeof Tabs> = {
  title: "Rosetta/Tabs",
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Interactive: Story = {
  render: () => <TabsDemo />,
};

export const CodeActive: Story = {
  args: {
    tabs,
    activeTab: "code",
    onTabChange: () => {},
    children: <div className="p-4 text-sm text-[var(--color-text-primary)]">Code panel content</div>,
  },
};

export const DatabaseActive: Story = {
  args: {
    tabs,
    activeTab: "database",
    onTabChange: () => {},
    children: <div className="p-4 text-sm text-[var(--color-text-primary)]">Database panel content</div>,
  },
};
