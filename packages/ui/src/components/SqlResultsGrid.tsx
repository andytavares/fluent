"use client";

type SqlResult =
  | { kind: "rows"; columns: string[]; rows: string[][] }
  | { kind: "message"; message: string }
  | { kind: "error"; message: string };

interface SqlResultsGridProps {
  result: SqlResult | null;
  isRunning: boolean;
}

export function SqlResultsGrid({ result, isRunning }: SqlResultsGridProps) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-4 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-text-link)]" />
        <span className="text-sm font-medium text-[var(--color-text-link)]">Running query…</span>
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-3 text-sm text-[var(--color-text-disabled)]">
        Run a query to see results.
      </div>
    );
  }

  if (result.kind === "error") {
    return (
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-status-error-subtle)] px-4 py-3 text-sm font-mono text-[var(--color-status-error-text)]">
        {result.message}
      </div>
    );
  }

  if (result.kind === "message") {
    return (
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-mono text-[var(--color-text-primary)]">
        {result.message}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]">
            {result.columns.map((col) => (
              <th key={col} className="py-2 px-4 text-left font-medium whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length === 0 ? (
            <tr>
              <td
                colSpan={result.columns.length}
                className="py-3 px-4 text-[var(--color-text-disabled)]"
              >
                No rows returned.
              </td>
            </tr>
          ) : (
            result.rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-primary)] last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-4 font-mono whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
