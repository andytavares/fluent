"use client";

import { clsx } from "clsx";
import { ConceptNode } from "@fluent/ui";
import type { LearnerState } from "@fluent/ui";

interface ConceptStateRow {
  conceptId: string;
  state: LearnerState;
  achievedVia: "placement" | "test_out" | "lesson" | null;
  concept: { slug: string; title: string; position: number };
}

interface LearningPathProps {
  trackSlug: string;
  conceptStates: ConceptStateRow[];
  hasCapstone?: boolean;
}

function dotClass(state: LearnerState) {
  if (state === "mastered" || state === "completed")
    return "bg-[var(--color-status-success-bg)] border-[var(--color-status-success-bg)]";
  if (state === "available" || state === "in_progress")
    return "bg-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)]";
  return "bg-[var(--color-surface-base)] border-[var(--color-border-default)]";
}

export function LearningPath({ trackSlug, conceptStates, hasCapstone }: LearningPathProps) {
  return (
    <div className="relative pl-7">
      {/* Vertical track line */}
      <div className="absolute left-[0.6875rem] top-3 bottom-3 w-px bg-[var(--color-border-subtle)]" />

      <ol className="flex flex-col gap-2">
        {conceptStates.map((cs) => (
          <li key={cs.conceptId} className="relative flex items-center gap-4">
            {/* State indicator dot */}
            <div
              className={clsx(
                "relative z-10 flex-shrink-0 w-3 h-3 rounded-full border-2 -ml-7",
                dotClass(cs.state),
              )}
            />
            <div className="flex-1 min-w-0">
              <ConceptNode
                concept={cs.concept}
                state={cs.state}
                {...(cs.achievedVia !== null ? { achievedVia: cs.achievedVia } : {})}
                {...(cs.state !== "locked"
                  ? { href: `/tracks/${trackSlug}/concepts/${cs.concept.slug}` }
                  : {})}
              />
            </div>
          </li>
        ))}

        {hasCapstone && (
          <li className="relative flex items-center gap-4">
            <div className="relative z-10 flex-shrink-0 w-3 h-3 rounded-full border-2 -ml-7 bg-[var(--color-surface-base)] border-[var(--color-border-default)]" />
            <div className="flex-1">
              <a
                href={`/tracks/${trackSlug}/capstone`}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-4 hover:border-[var(--color-interactive-primary)]/50 transition-colors"
              >
                <span className="text-xs font-mono text-[var(--color-interactive-primary)] w-6">★</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Capstone Project</span>
              </a>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
