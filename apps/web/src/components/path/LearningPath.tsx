"use client";

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

export function LearningPath({ trackSlug, conceptStates, hasCapstone }: LearningPathProps) {
  return (
    <ol className="flex flex-col gap-2">
      {conceptStates.map((cs) => (
        <li key={cs.conceptId}>
          <ConceptNode
            concept={cs.concept}
            state={cs.state}
            {...(cs.achievedVia !== null ? { achievedVia: cs.achievedVia } : {})}
            {...(cs.state !== "locked"
              ? { href: `/tracks/${trackSlug}/concepts/${cs.concept.slug}` }
              : {})}
          />
        </li>
      ))}
      {hasCapstone && (
        <li>
          <a
            href={`/tracks/${trackSlug}/capstone`}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-4 hover:border-[var(--color-border-focus)]"
          >
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              ★ Go CRUD API Capstone
            </span>
          </a>
        </li>
      )}
    </ol>
  );
}
