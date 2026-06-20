"use client";

import { useState } from "react";
import { Button } from "./Button";
import { CodeEditor } from "./CodeEditor";

interface PlacementTaskProps {
  concept: { slug: string; title: string };
  stub: string;
  onSubmit: (code: string) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export function PlacementTask({
  concept,
  stub,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: PlacementTaskProps) {
  const [code, setCode] = useState(stub);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {concept.title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Show what you know. If you pass, this concept is marked complete.
        </p>
      </div>

      <CodeEditor value={code} onChange={setCode} />

      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => onSubmit(code)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Running…" : "Submit"}
        </Button>
        <Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
          Skip this concept
        </Button>
      </div>
    </div>
  );
}
