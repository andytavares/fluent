"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";
import { CodeEditor } from "./CodeEditor";

const TESTOUT_DURATION_SECONDS = 4 * 60;

interface TestOutModalProps {
  open: boolean;
  onClose: () => void;
  concept: { title: string; stub: string; taskPrompt?: string };
  onSubmit: (code: string) => void;
  onEscape: () => void;
  isSubmitting?: boolean;
  /** Pass when a submission has completed. null = no result yet. */
  result?: { passed: boolean } | null;
  onNext?: () => void;
}

export function TestOutModal({
  open,
  onClose,
  concept,
  onSubmit,
  onEscape,
  isSubmitting = false,
  result = null,
  onNext,
}: TestOutModalProps) {
  const [code, setCode] = useState(concept.stub);
  const [secondsLeft, setSecondsLeft] = useState(TESTOUT_DURATION_SECONDS);
  const [view, setView] = useState<"task" | "result">("task");

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(TESTOUT_DURATION_SECONDS);
    setCode(concept.stub);
    setView("task");
  }, [open, concept.stub]);

  // Transition to result view when a result arrives
  useEffect(() => {
    if (result != null) setView("result");
  }, [result]);

  useEffect(() => {
    if (!open || secondsLeft <= 0 || view === "result") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onSubmit(code);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, code, onSubmit, view]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 flex w-full max-w-3xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] shadow-xl">

          {view === "task" ? (
            <>
              {/* Fixed header */}
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] px-6 py-4">
                <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Test out: {concept.title}
                </Dialog.Title>
                <span
                  className={`font-mono text-sm tabular-nums ${secondsLeft < 60 ? "text-[var(--color-status-error-text)]" : "text-[var(--color-text-secondary)]"}`}
                >
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {concept.taskPrompt && (
                  <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {concept.taskPrompt}
                    </p>
                  </div>
                )}
                <CodeEditor value={code} onChange={setCode} />
              </div>

              {/* Fixed footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-border-subtle)] px-6 py-4">
                <Button variant="ghost" onClick={onEscape} disabled={isSubmitting}>
                  I&apos;d rather do the lesson
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onSubmit(code)}
                  disabled={isSubmitting || secondsLeft === 0}
                >
                  {isSubmitting ? "Checking…" : "Submit"}
                </Button>
              </div>
            </>
          ) : (
            <div className="p-6">
              <Dialog.Title className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
                {result?.passed ? "You passed!" : "Not quite"}
              </Dialog.Title>

              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                {result?.passed
                  ? "All tests passed. You can skip this lesson and move on."
                  : "Some tests failed. You can try again or work through the lesson to learn more."}
              </p>

              <div className="flex items-center justify-between">
                {result?.passed ? (
                  <>
                    <Button variant="ghost" onClick={onClose}>
                      Stay and review
                    </Button>
                    <Button variant="primary" onClick={onNext ?? onClose}>
                      Skip lesson →
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={onEscape}>
                      Take the lesson
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setView("task");
                        setSecondsLeft(TESTOUT_DURATION_SECONDS);
                      }}
                    >
                      Try again
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
