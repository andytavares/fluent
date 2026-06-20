"use client";

import { useEffect, useRef } from "react";

interface CongratsModalProps {
  open: boolean;
  passCount: number;
  runtimeMs?: number | undefined;
  hasNext: boolean;
  onNext: () => void;
  onClose: () => void;
}

export function CongratsModal({ open, passCount, runtimeMs, hasNext, onNext, onClose }: CongratsModalProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;

    void import("canvas-confetti").then(({ default: confetti }) => {
      void confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#6366f1", "#4ade80", "#f8fafc", "#818cf8", "#fbbf24"],
      });
    });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
          All tests passed!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {passCount} {passCount === 1 ? "test" : "tests"} passed
          {runtimeMs ? ` in ${runtimeMs}ms` : ""}.
        </p>

        <div className="flex flex-col gap-3">
          {hasNext ? (
            <button
              onClick={onNext}
              className="w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)] transition-colors"
            >
              Next lesson →
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)] transition-colors"
            >
              View track →
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-[var(--color-border-default)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
