"use client";

import { useState } from "react";
import { Button } from "./Button";
import { CodeEditor } from "./CodeEditor";

interface PlacementTaskProps {
  concept: { slug: string; title: string };
  stub: string;
  taskPrompt?: string;
  onSubmit: (code: string) => void;
  onSkip: () => void;
  onTakeLesson: () => void;
  onTryAgain?: () => void;
  isSubmitting?: boolean;
  result?: { passed: boolean } | null;
}

export function PlacementTask({
  concept,
  stub,
  taskPrompt,
  onSubmit,
  onSkip,
  onTakeLesson,
  onTryAgain,
  isSubmitting = false,
  result,
}: PlacementTaskProps) {
  const [code, setCode] = useState(stub);

  function handleTryAgain() {
    setCode(stub);
    onTryAgain?.();
  }

  if (result) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {concept.title}
          </h2>
        </div>
        <div
          className={`rounded-lg border p-4 text-sm ${
            result.passed
              ? "border-green-700 bg-green-950 text-green-300"
              : "border-red-700 bg-red-950 text-red-300"
          }`}
        >
          {result.passed
            ? "You passed! This concept will be marked complete."
            : "Not quite. You can try again or take the lesson to learn this concept."}
        </div>
        {result.passed ? (
          <Button variant="primary" onClick={onSkip}>
            Continue →
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleTryAgain}>
              Try again
            </Button>
            <Button variant="ghost" onClick={onTakeLesson}>
              Take the lesson
            </Button>
          </div>
        )}
      </div>
    );
  }

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

      {taskPrompt && (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
          {taskPrompt}
        </div>
      )}

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
