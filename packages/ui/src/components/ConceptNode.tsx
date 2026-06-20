"use client";

import { useState } from "react";
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

export function ConceptNode({ concept, state, achievedVia, href, onClick }: ConceptNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const isNavigable = state === "available" || state === "in_progress";
  const isLocked = state === "locked";
  const isMastered = state === "mastered";
  const isCompleted = state === "completed";

  const content = (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-xl border p-4 transition-colors",
        {
          "border-[var(--color-border-subtle)] opacity-50 cursor-not-allowed": isLocked,
          "border-[var(--color-border-default)] bg-[var(--color-surface-raised)] cursor-pointer hover:border-[var(--color-border-focus)]":
            isNavigable,
          "border-[var(--color-status-success-bg)]/40 bg-[var(--color-surface-raised)]":
            isMastered || isCompleted,
        },
      )}
    >
      <span className="text-xs font-mono text-[var(--color-text-disabled)] w-6">
        {String(concept.position).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {concept.title}
        </span>
        {achievedVia && (
          <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
            via {achievedVia.replace("_", " ")}
          </span>
        )}
      </div>
      <Badge variant={state}>{STATE_LABELS[state]}</Badge>
      {(isMastered || isCompleted) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      )}
    </div>
  );

  if (isLocked) {
    return <div aria-disabled="true">{content}</div>;
  }

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
