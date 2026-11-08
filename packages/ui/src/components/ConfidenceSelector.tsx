"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";

const CONFIDENCE_LEVELS = [
  {
    value: "beginner",
    label: "Brand new",
    description: "I am new to this.",
  },
  {
    value: "some",
    label: "Some experience",
    description: "I have used it or something like it.",
  },
  {
    value: "experienced",
    label: "I know this",
    description: "Test me and skip what I know.",
  },
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]["value"];

interface ConfidenceSelectorProps {
  value: ConfidenceLevel | null;
  onChange: (value: ConfidenceLevel) => void;
}

export function ConfidenceSelector({ value, onChange }: ConfidenceSelectorProps) {
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(v) => onChange(v as ConfidenceLevel)}
      className="flex flex-col gap-2.5"
      aria-label="Select your experience level"
    >
      {CONFIDENCE_LEVELS.map((level) => (
        <RadioGroup.Item
          key={level.value}
          value={level.value}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-4 py-3.5 text-left transition-all hover:border-[var(--color-interactive-primary)]/50 data-[state=checked]:border-[var(--color-interactive-primary)] data-[state=checked]:bg-[var(--color-amber-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
        >
          {/* Radio indicator */}
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-border-default)] data-[state=checked]:border-[var(--color-interactive-primary)]">
            <RadioGroup.Indicator className="block h-2 w-2 rounded-full bg-[var(--color-interactive-primary)]" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--color-text-primary)]">
              {level.label}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {level.description}
            </div>
          </div>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
