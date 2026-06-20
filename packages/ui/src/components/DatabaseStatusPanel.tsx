"use client";

import { clsx } from "clsx";

type DBStatus = "provisioning" | "connected" | "error" | "expired";

interface DatabaseStatusPanelProps {
  status: DBStatus;
  expiresAt?: Date | null;
}

const STATUS_CONFIG: Record<DBStatus, { label: string; color: string }> = {
  provisioning: { label: "Provisioning database…", color: "text-[var(--color-text-link)]" },
  connected: { label: "Database connected", color: "text-[var(--color-status-success-text)]" },
  error: { label: "Database error", color: "text-[var(--color-status-error-text)]" },
  expired: { label: "Session expired", color: "text-[var(--color-status-warning-text)]" },
};

export function DatabaseStatusPanel({ status, expiresAt }: DatabaseStatusPanelProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={clsx("h-2 w-2 rounded-full", {
            "animate-pulse bg-[var(--color-text-link)]": status === "provisioning",
            "bg-[var(--color-status-success-text)]": status === "connected",
            "bg-[var(--color-status-error-text)]": status === "error",
            "bg-[var(--color-status-warning-text)]": status === "expired",
          })}
        />
        <span className={clsx("text-sm font-medium", config.color)}>{config.label}</span>
      </div>
      {status === "connected" && expiresAt && (
        <span className="text-xs text-[var(--color-text-secondary)]">
          Expires at {expiresAt.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
