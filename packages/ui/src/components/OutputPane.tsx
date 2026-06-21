"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

type OutputState = "idle" | "streaming" | "complete" | "timeout" | "error";

interface OutputEvent {
  type: "stdout" | "stderr" | "result";
  data?: string;
  exit_code?: number;
  runtime_ms?: number;
  timed_out?: boolean;
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: string;
  details: string[];
}

function parseTestResults(lines: OutputEvent[]): TestResult[] {
  const allText = lines
    .filter((l) => l.type === "stdout" || l.type === "stderr")
    .map((l) => l.data ?? "")
    .join("\n");

  const results: TestResult[] = [];
  let current: TestResult | null = null;

  for (const raw of allText.split("\n")) {
    const line = raw.trimEnd();

    // Go testing format: === RUN / --- PASS / --- FAIL
    const runMatch = line.match(/^=== RUN\s+(\S+)/);
    const goPassMatch = line.match(/^--- PASS:\s+(\S+)\s+\(([^)]+)\)/);
    const goFailMatch = line.match(/^--- FAIL:\s+(\S+)\s+\(([^)]+)\)/);

    // Custom format used by all non-Go runners: "  PASS: name" / "PASS: name" / "  FAIL: name — reason"
    const customPassMatch = line.match(/^\s*PASS:\s+(.+)$/);
    const customFailMatch = line.match(/^\s*FAIL:\s+(.+?)(?:\s+[—–-]\s+(.+))?$/);

    if (runMatch) {
      if (current) results.push(current);
      current = { name: runMatch[1]!, passed: false, duration: "", details: [] };
    } else if (goPassMatch && current) {
      current.passed = true;
      current.duration = goPassMatch[2]!;
      results.push(current);
      current = null;
    } else if (goFailMatch && current) {
      current.passed = false;
      current.duration = goFailMatch[2]!;
      results.push(current);
      current = null;
    } else if (customPassMatch) {
      if (current) results.push(current);
      results.push({ name: customPassMatch[1]!.trim(), passed: true, duration: "", details: [] });
      current = null;
    } else if (customFailMatch) {
      if (current) results.push(current);
      const detail = customFailMatch[2] ? [customFailMatch[2].trim()] : [];
      results.push({ name: customFailMatch[1]!.trim(), passed: false, duration: "", details: detail });
      current = null;
    } else if (current && line.trim() && !line.startsWith("FAIL") && !line.startsWith("ok ")) {
      current.details.push(line.replace(/^\s{4}/, ""));
    }
  }
  if (current) results.push(current);
  return results;
}

// Parse a detail line into structured got/want if possible
function parseDetailLine(line: string): { label: string; value: string } | null {
  const m = line.match(/^\s*(.+?):\s*(.+)$/);
  if (!m) return null;
  const label = m[1]!.trim().toLowerCase();
  if (label === "got" || label === "want" || label === "expected" || label === "actual" || label.startsWith("got ") || label.startsWith("want ")) {
    return { label: m[1]!.trim(), value: m[2]!.trim() };
  }
  return null;
}

function isFrameworkLine(t: string) {
  return (
    t.startsWith("=== RUN") ||
    t.startsWith("=== PAUSE") ||
    t.startsWith("=== CONT") ||
    t.startsWith("--- PASS") ||
    t.startsWith("--- FAIL") ||
    t.startsWith("--- SKIP") ||
    t === "PASS" ||
    t === "FAIL" ||
    t.startsWith("ok ") ||
    t.startsWith("FAIL\t") ||
    /^\s*PASS:/.test(t) ||
    /^\s*FAIL:/.test(t) ||
    /^\d+ passed,\s*\d+ failed/.test(t) ||
    /^\s{4}\S/.test(t)
  );
}

interface OutputPaneProps {
  state: OutputState;
  lines: OutputEvent[];
  exitCode?: number;
  runtimeMs?: number;
  isSuite?: boolean;
}

function TestRow({ result }: { result: TestResult }) {
  const [expanded, setExpanded] = useState(!result.passed);
  const hasDetails = result.details.length > 0;

  return (
    <div className="border-b border-[var(--color-border-subtle)] last:border-0">
      <button
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className={clsx(
          "w-full flex items-center gap-2 px-4 py-3 text-left transition-colors",
          hasDetails ? "cursor-pointer hover:bg-[var(--color-surface-raised)]" : "cursor-default",
        )}
      >
        <span className={clsx("text-sm font-medium shrink-0", result.passed ? "text-[var(--color-status-success-text)]" : "text-[var(--color-status-error-text)]")}>
          {result.passed ? "✓" : "✗"}
        </span>
        <span className="text-sm font-mono text-[var(--color-text-primary)] flex-1 min-w-0 truncate">
          {result.name}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)] shrink-0">{result.duration}</span>
        {hasDetails && (
          <span className="text-xs text-[var(--color-text-secondary)] shrink-0 ml-1">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </button>

      {expanded && hasDetails && (
        <div className="px-4 pb-3 space-y-1">
          {result.details.map((d, i) => {
            const parsed = parseDetailLine(d);
            if (parsed) {
              const isGot = parsed.label.toLowerCase().startsWith("got") || parsed.label.toLowerCase().startsWith("actual");
              const isWant = parsed.label.toLowerCase().startsWith("want") || parsed.label.toLowerCase().startsWith("expected");
              return (
                <div key={i} className={clsx(
                  "flex items-baseline gap-2 rounded px-2 py-1 font-mono text-xs",
                  isWant ? "bg-[var(--color-status-success-subtle)]" : isGot ? "bg-[var(--color-status-error-subtle)]" : "bg-[var(--color-bg-subtle)]",
                )}>
                  <span className={clsx(
                    "shrink-0 font-semibold w-16",
                    isWant ? "text-[var(--color-status-success-text)]" : isGot ? "text-[var(--color-status-error-text)]" : "text-[var(--color-text-secondary)]",
                  )}>
                    {parsed.label}:
                  </span>
                  <span className="text-[var(--color-text-primary)] break-all">{parsed.value}</span>
                </div>
              );
            }
            return (
              <div key={i} className="font-mono text-xs text-[var(--color-status-error-text)] leading-snug px-2">{d}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OutputPane({ state, lines, exitCode, runtimeMs, isSuite }: OutputPaneProps) {
  const [tab, setTab] = useState<"output" | "results">("output");

  const testResults = isSuite && state === "complete" ? parseTestResults(lines) : [];
  const passCount = testResults.filter((t) => t.passed).length;
  const failCount = testResults.filter((t) => !t.passed).length;

  useEffect(() => {
    if (isSuite && state === "complete") setTab("results");
  }, [isSuite, state]);

  useEffect(() => {
    if (state === "streaming") setTab("output");
  }, [state]);

  const programRows: { text: string; isStderr: boolean }[] = [];
  for (const line of lines) {
    for (const row of (line.data ?? "").split("\n")) {
      const t = row.trimEnd();
      if (!t) continue;
      if (isSuite && isFrameworkLine(t)) continue;
      programRows.push({ text: t, isStderr: line.type === "stderr" });
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] overflow-hidden">

      {/* Tab bar */}
      <div className="flex items-center border-b border-[var(--color-border-subtle)]">
        <div className="flex">
          <button
            onClick={() => setTab("output")}
            className={clsx(
              "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
              tab === "output"
                ? "border-[var(--color-interactive-primary)] text-[var(--color-text-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            Output
          </button>
          {isSuite && (
            <button
              onClick={() => setTab("results")}
              className={clsx(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                tab === "results"
                  ? "border-[var(--color-interactive-primary)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              Results
              {state === "complete" && testResults.length > 0 && (
                <span className={clsx(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  failCount > 0
                    ? "bg-[var(--color-status-error-subtle)] text-[var(--color-status-error-text)]"
                    : "bg-[var(--color-status-success-subtle)] text-[var(--color-status-success-text)]",
                )}>
                  {failCount > 0 ? `${failCount} failed` : `${passCount} passed`}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="ml-auto pr-4 flex items-center gap-2 text-xs">
          {state === "streaming" && <span className="text-[var(--color-text-link)]">Running…</span>}
          {state === "complete" && exitCode !== undefined && (
            <span className={exitCode === 0 ? "text-[var(--color-status-success-text)]" : "text-[var(--color-status-error-text)]"}>
              Exit {exitCode} · {runtimeMs}ms
            </span>
          )}
          {state === "timeout" && <span className="text-[var(--color-status-warning-text)]">Timed out</span>}
          {state === "error" && <span className="text-[var(--color-status-error-text)]">Error</span>}
        </div>
      </div>

      {/* Output tab */}
      {tab === "output" && (
        <div className="min-h-[120px] max-h-[300px] overflow-auto p-4 font-mono text-sm">
          {state === "idle" ? (
            <span className="text-[var(--color-text-disabled)]">Run your code to see output.</span>
          ) : programRows.length === 0 ? (
            <span className="text-[var(--color-text-disabled)]">
              {isSuite ? "No program output — see Results tab for test outcomes." : state === "streaming" ? "Running…" : "No output."}
            </span>
          ) : (
            programRows.map((r, i) => (
              <div key={i} className={clsx("leading-snug", r.isStderr ? "text-[var(--color-status-error-text)]" : "text-[var(--color-text-primary)]")}>
                {r.text}
              </div>
            ))
          )}
        </div>
      )}

      {/* Results tab */}
      {tab === "results" && (
        <div className="min-h-[120px] max-h-[400px] overflow-auto">
          {state !== "complete" ? (
            <div className="p-4 text-sm text-[var(--color-text-secondary)]">
              {state === "streaming" ? "Running tests…" : "Submit & check tests to see results."}
            </div>
          ) : testResults.length === 0 ? (
            <div className="p-4 text-sm text-[var(--color-text-secondary)]">No test results found.</div>
          ) : (
            <>
              <div className={clsx(
                "flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border-subtle)]",
                failCount === 0 ? "bg-[var(--color-status-success-subtle)]" : "bg-[var(--color-status-error-subtle)]",
              )}>
                {failCount === 0 ? (
                  <span className="text-sm font-semibold text-[var(--color-status-success-text)]">✓ All {passCount} tests passed</span>
                ) : (
                  <span className="text-sm font-semibold text-[var(--color-status-error-text)]">✗ {failCount} of {testResults.length} tests failed</span>
                )}
                {runtimeMs && <span className="text-xs text-[var(--color-text-secondary)]">{runtimeMs}ms</span>}
                <span className="ml-auto text-xs text-[var(--color-text-secondary)]">Click a test to expand</span>
              </div>

              <div>
                {testResults.map((t) => (
                  <TestRow key={t.name} result={t} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
