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
    <div className="mb-5">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--color-text-disabled)]">
        {name}
      </span>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-[var(--color-text-disabled)]">{i}</span>
            <span
              className={[
                "inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-md px-2 font-mono text-sm font-medium border transition-colors",
                highlighted.has(i)
                  ? "bg-[var(--color-accent-subtle,#1e3a5f)] border-[var(--color-accent,#3b82f6)] text-[var(--color-accent,#3b82f6)]"
                  : "bg-[var(--color-surface-raised)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
              ].join(" ")}
            >
              {String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScalarsView({ entries }: { entries: [string, unknown][] }) {
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
      {entries.map(([key, val]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-disabled)]">
            {key}
          </span>
          <span className="font-mono text-sm text-[var(--color-text-primary)]">
            {typeof val === "object" ? JSON.stringify(val) : String(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TracePanel({ frames }: TracePanelProps) {
  const [index, setIndex] = useState(0);

  if (frames.length === 0) return null;

  const safeIndex = Math.min(index, frames.length - 1);
  const frame = frames[safeIndex]!;

  const stateEntries = Object.entries(frame.state ?? {});
  const arrayEntries = stateEntries.filter(([, v]) => Array.isArray(v)) as [string, unknown[]][];
  const scalarEntries = stateEntries.filter(([, v]) => !Array.isArray(v));
  const arrayHighlights = frame.highlights?.arrays ?? {};

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(frames.length - 1, i + 1));

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          Trace
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-[var(--color-text-disabled)]">
            {safeIndex + 1} / {frames.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              disabled={safeIndex === 0}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] disabled:opacity-25 transition-colors"
              aria-label="Previous step"
            >
              ‹
            </button>
            <button
              onClick={next}
              disabled={safeIndex === frames.length - 1}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] disabled:opacity-25 transition-colors"
              aria-label="Next step"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Step label */}
      {frame.label && (
        <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-5 py-2.5">
          <span className="font-mono text-sm text-[var(--color-text-primary)]">{frame.label}</span>
        </div>
      )}

      {/* State: arrays first, then scalars */}
      <div className="px-5 py-5">
        {arrayEntries.length > 0 && (
          <div className="mb-4">
            {arrayEntries.map(([key, val]) => (
              <ArrayView
                key={key}
                name={key}
                values={val}
                highlighted={new Set<number>(arrayHighlights[key] ?? [])}
              />
            ))}
          </div>
        )}
        {scalarEntries.length > 0 && <ScalarsView entries={scalarEntries} />}
        {stateEntries.length === 0 && (
          <span className="text-xs text-[var(--color-text-disabled)]">No state captured.</span>
        )}
      </div>

      {/* Scrubber */}
      <div className="border-t border-[var(--color-border-subtle)] px-5 py-3">
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
