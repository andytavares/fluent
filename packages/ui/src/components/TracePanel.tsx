"use client";

import { useState } from "react";

export interface TraceFrame {
  label?: string;
  state?: Record<string, unknown>;
  highlights?: {
    arrays?: Record<string, number[]>;
    nodes?: string[];
  };
}

interface TracePanelProps {
  frames: TraceFrame[];
}

function ArrayView({ name, values, highlighted }: { name: string; values: unknown[]; highlighted: Set<number> }) {
  return (
    <div className="mb-3">
      <span className="text-xs font-medium text-[var(--color-text-secondary)] mr-2">{name}</span>
      <div className="inline-flex flex-wrap gap-1 mt-1">
        {values.map((v, i) => (
          <span
            key={i}
            className={[
              "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1.5 font-mono text-xs border",
              highlighted.has(i)
                ? "bg-[var(--color-accent-subtle,#1e3a5f)] border-[var(--color-accent,#3b82f6)] text-[var(--color-accent,#3b82f6)] font-semibold"
                : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
            ].join(" ")}
          >
            {String(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

function StateView({ state, highlights }: { state: Record<string, unknown>; highlights?: TraceFrame["highlights"] }) {
  if (Object.keys(state).length === 0) return null;

  const arrayHighlights = highlights?.arrays ?? {};

  return (
    <div className="space-y-2">
      {Object.entries(state).map(([key, val]) => {
        if (Array.isArray(val)) {
          const hl = new Set<number>(arrayHighlights[key] ?? []);
          return <ArrayView key={key} name={key} values={val} highlighted={hl} />;
        }
        return (
          <div key={key} className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] w-24 shrink-0 truncate">{key}</span>
            <span className="font-mono text-xs text-[var(--color-text-primary)] break-all">
              {typeof val === "object" ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function TracePanel({ frames }: TracePanelProps) {
  const [index, setIndex] = useState(0);

  if (frames.length === 0) return null;

  const safeIndex = Math.min(index, frames.length - 1);
  const frame = frames[safeIndex]!;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(frames.length - 1, i + 1));

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-2">
        <span className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
          Visualizer
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Step {safeIndex + 1} / {frames.length}
          </span>
          <button
            onClick={prev}
            disabled={safeIndex === 0}
            className="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
            aria-label="Previous step"
          >
            ‹
          </button>
          <button
            onClick={next}
            disabled={safeIndex === frames.length - 1}
            className="rounded p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30"
            aria-label="Next step"
          >
            ›
          </button>
        </div>
      </div>

      {/* Step label */}
      {frame.label && (
        <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-4 py-2">
          <span className="text-xs text-[var(--color-text-primary)]">{frame.label}</span>
        </div>
      )}

      {/* State */}
      <div className="px-4 py-3">
        <StateView state={frame.state ?? {}} highlights={frame.highlights} />
        {Object.keys(frame.state ?? {}).length === 0 && (
          <span className="text-xs text-[var(--color-text-tertiary)]">No state captured for this step.</span>
        )}
      </div>

      {/* Scrubber */}
      <div className="border-t border-[var(--color-border-subtle)] px-4 py-2">
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={safeIndex}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="w-full accent-[var(--color-accent,#3b82f6)]"
        />
      </div>
    </div>
  );
}
