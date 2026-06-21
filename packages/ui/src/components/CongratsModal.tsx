"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

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
    if (!open) { firedRef.current = false; return; }
    if (firedRef.current) return;
    firedRef.current = true;
    void import("canvas-confetti").then(({ default: confetti }) => {
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#f59e0b", "#34d399", "#fafafa", "#fbbf24", "#6ee7b7"],
      });
    });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-success-bg)]/15">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-status-success-text)]">
            <path d="M4 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
          All tests passed
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-7">
          <span className="font-mono text-[var(--color-status-success-text)]">{passCount}</span>{" "}
          {passCount === 1 ? "test" : "tests"} passed
          {runtimeMs ? (
            <> in <span className="font-mono">{runtimeMs}ms</span></>
          ) : null}.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" className="w-full" onClick={onNext}>
            {hasNext ? "Next lesson →" : "Back to track →"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Stay here
          </Button>
        </div>
      </div>
    </div>
  );
}
