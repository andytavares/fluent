"use client";

import { clsx } from "clsx";
import { Badge } from "./Badge";

interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
  response_body?: unknown;
}

interface VerificationChecklistProps {
  results: HttpTestResult[] | null;
  isVerifying: boolean;
}

export function VerificationChecklist({ results, isVerifying }: VerificationChecklistProps) {
  if (isVerifying) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-4 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-text-link)]" />
        <span className="text-sm font-medium text-[var(--color-text-link)]">Running verification…</span>
      </div>
    );
  }

  if (results === null) {
    return (
      <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-3 text-sm text-[var(--color-text-disabled)]">
        Run Verify to check this step.
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] overflow-hidden">
      {results.map((result, i) => (
        <div
          key={`${result.method}-${result.path}-${i}`}
          className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3 text-sm last:border-0"
        >
          <span className="font-mono text-[var(--color-text-primary)] flex-1 min-w-0 truncate">
            <span className="font-semibold">{result.method}</span> {result.path}
          </span>
          <span className="text-xs font-mono text-[var(--color-text-secondary)] shrink-0">
            {result.status}
          </span>
          <Badge
            variant={result.passed ? "available" : "default"}
            className={clsx(!result.passed && "bg-[var(--color-status-error-subtle)] text-[var(--color-status-error-text)]")}
          >
            {result.passed ? "Pass" : "Fail"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
