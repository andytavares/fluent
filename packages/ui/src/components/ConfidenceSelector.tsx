"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";

const CONFIDENCE_LEVELS = [
  {
    value: "beginner",
    label: "Complete beginner",
    description: "I have little to no experience with Go or similar languages.",
  },
  {
    value: "some",
    label: "Some experience",
    description: "I have tried Go before or know another language well.",
  },
  {
    value: "experienced",
    label: "Experienced developer",
    description: "I know Go or a comparable language and want to skip ahead.",
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
      className="flex flex-col gap-3"
      aria-label="Select your confidence level"
    >
      {CONFIDENCE_LEVELS.map((level) => (
        <RadioGroup.Item
          key={level.value}
          value={level.value}
          style={{ textAlign: "left" }}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-4 text-left transition-colors hover:border-[var(--color-border-focus)] data-[state=checked]:border-[var(--color-border-focus)] data-[state=checked]:bg-[var(--color-interactive-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
        >
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              width: 16,
              height: 16,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: `2px solid ${value === level.value ? "var(--color-interactive-primary)" : "var(--color-border-default)"}`,
            }}
          >
            <RadioGroup.Indicator
              style={{
                display: "block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--color-interactive-primary)",
              }}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--color-text-primary)]">
              {level.label}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {level.description}
            </div>
          </div>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
