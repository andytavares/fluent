"use client";

import { clsx } from "clsx";
import { Badge } from "./Badge";
import type { LearnerState } from "./types";

interface ConceptNodeProps {
  concept: {
    slug: string;
    title: string;
    position: number;
  };
  state: LearnerState;
  achievedVia?: "placement" | "test_out" | "lesson" | null;
  href?: string;
  onClick?: () => void;
}

const STATE_LABELS: Record<LearnerState, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  mastered: "Mastered",
  completed: "Completed",
};

const CHECK = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ConceptNode({ concept, state, achievedVia, href, onClick }: ConceptNodeProps) {
  const isLocked = state === "locked";
  const isAvailable = state === "available";
  const isInProgress = state === "in_progress";
  const isMastered = state === "mastered" || state === "completed";

  const content = (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
        isLocked && "border-[var(--color-border-subtle)] opacity-40 cursor-not-allowed",
        (isAvailable || isInProgress) && "border-[var(--color-border-default)] bg-[var(--color-surface-raised)] hover:border-[var(--color-interactive-primary)]/50",
        isMastered && "border-[var(--color-status-success-bg)]/20 bg-[var(--color-surface-raised)]",
      )}
    >
      {/* Position number */}
      <span
        className={clsx(
          "text-xs font-mono w-6 shrink-0 text-center",
          isLocked && "text-[var(--color-text-disabled)]",
          (isAvailable || isInProgress) && "text-[var(--color-interactive-primary)]",
          isMastered && "text-[var(--color-status-success-text)]",
        )}
      >
        {isMastered ? CHECK : String(concept.position).padStart(2, "0")}
      </span>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span
          className={clsx(
            "text-sm font-medium",
            isLocked ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-primary)]",
          )}
        >
          {concept.title}
        </span>
        {achievedVia && (
          <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
            via {achievedVia.replace("_", " ")}
          </span>
        )}
      </div>

      {/* State badge */}
      {!isLocked && <Badge variant={state}>{STATE_LABELS[state]}</Badge>}
    </div>
  );

  if (isLocked) return <div aria-disabled="true">{content}</div>;
  if (href) return <a href={href} className="block">{content}</a>;
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}
