"use client";

import { clsx } from "clsx";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] overflow-hidden">
      <div className="flex items-center border-b border-[var(--color-border-subtle)]">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                tab.id === activeTab
                  ? "border-[var(--color-interactive-primary)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
