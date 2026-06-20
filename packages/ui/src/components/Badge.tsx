import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeVariant = "locked" | "available" | "in_progress" | "mastered" | "completed" | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  locked: "bg-[var(--color-surface-overlay)] text-[var(--color-text-disabled)]",
  available: "bg-[var(--color-status-success-bg)]/20 text-[var(--color-status-success-text)]",
  in_progress: "bg-[var(--color-interactive-primary)]/20 text-[var(--color-text-link)]",
  mastered: "bg-[var(--color-status-success-bg)] text-[var(--color-interactive-primary-text)]",
  completed: "bg-[var(--color-status-success-bg)] text-[var(--color-interactive-primary-text)]",
  default: "bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
