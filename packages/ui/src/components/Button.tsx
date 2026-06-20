import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[var(--color-interactive-primary)] text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]":
              variant === "primary",
            "bg-[var(--color-interactive-secondary)] text-[var(--color-interactive-secondary-text)] hover:bg-[var(--color-interactive-secondary-hover)] border border-[var(--color-border-default)]":
              variant === "secondary",
            "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)]":
              variant === "ghost",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
