"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";
import { CodeEditor } from "./CodeEditor";

const TESTOUT_DURATION_SECONDS = 4 * 60;

interface TestOutModalProps {
  open: boolean;
  onClose: () => void;
  concept: { title: string; stub: string };
  onSubmit: (code: string) => void;
  onEscape: () => void;
  isSubmitting?: boolean;
}

export function TestOutModal({
  open,
  onClose,
  concept,
  onSubmit,
  onEscape,
  isSubmitting = false,
}: TestOutModalProps) {
  const [code, setCode] = useState(concept.stub);
  const [secondsLeft, setSecondsLeft] = useState(TESTOUT_DURATION_SECONDS);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(TESTOUT_DURATION_SECONDS);
    setCode(concept.stub);
  }, [open, concept.stub]);

  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onSubmit(code); // timer expired → submit with timerExpired=true
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, code, onSubmit]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
              Test out: {concept.title}
            </Dialog.Title>
            <span
              className={`font-mono text-sm tabular-nums ${secondsLeft < 60 ? "text-[var(--color-status-error-text)]" : "text-[var(--color-text-secondary)]"}`}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <div className="mb-4">
            <CodeEditor value={code} onChange={setCode} />
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onEscape} disabled={isSubmitting}>
              I'd rather do the lesson
            </Button>
            <Button
              variant="primary"
              onClick={() => onSubmit(code)}
              disabled={isSubmitting || secondsLeft === 0}
            >
              {isSubmitting ? "Checking…" : "Submit"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
