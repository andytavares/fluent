"use client";

import { clsx } from "clsx";

interface CapstoneStep {
  stepNumber: number;
  title: string;
  status: "locked" | "current" | "completed";
}

interface CapstoneStepListProps {
  steps: CapstoneStep[];
  totalSteps: number;
}

export function CapstoneStepList({ steps, totalSteps }: CapstoneStepListProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Capstone progress
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {completedCount}/{totalSteps} steps
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-[var(--color-surface-overlay)]">
        <div
          className="h-2 rounded-full bg-[var(--color-interactive-primary)] transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="flex flex-col gap-2">
        {steps.map((step) => (
          <li
            key={step.stepNumber}
            className={clsx("flex items-center gap-3 rounded-lg border p-3 text-sm", {
              "border-[var(--color-border-subtle)] text-[var(--color-text-disabled)]":
                step.status === "locked",
              "border-[var(--color-interactive-primary)]/60 bg-[var(--color-interactive-primary)]/10 text-[var(--color-text-primary)]":
                step.status === "current",
              "border-[var(--color-status-success-bg)]/40 text-[var(--color-text-secondary)]":
                step.status === "completed",
            })}
          >
            <span
              className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", {
                "bg-[var(--color-surface-overlay)] text-[var(--color-text-disabled)]":
                  step.status === "locked",
                "bg-[var(--color-interactive-primary)] text-white": step.status === "current",
                "bg-[var(--color-status-success-bg)] text-white": step.status === "completed",
              })}
            >
              {step.status === "completed" ? "✓" : step.stepNumber}
            </span>
            {step.title}
          </li>
        ))}
      </ol>
    </div>
  );
}
