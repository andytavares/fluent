"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useCapstoneSession } from "@/hooks/use-capstone-session";
import {
  CapstoneStepList,
  DatabaseStatusPanel,
  CodeEditor,
  Tabs,
  VerificationChecklist,
  SqlResultsGrid,
  SqlEditor,
} from "@fluent/ui";
import type { SqlEditorSchema } from "@fluent/ui";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
  response_body?: unknown;
}

interface ColumnInfo {
  name: string;
  type: string;
}

/** Escapes a value for use inside a single-quoted SQL string literal. */
function sqlStringLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Quotes an identifier (table/column name) so casing/special characters survive round-tripping. */
function sqlIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export default function CapstonePage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [code, setCode] = useState("");
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "database">("code");
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<{ time: string; space: string; basis: string } | null>(null);
  // Language-neutral starter query — each capstone project has its own
  // tables, so listing them is the one query that's always meaningful.
  const [sql, setSql] = useState(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';",
  );
  const [queryResult, setQueryResult] = useState<
    { kind: "rows"; columns: string[]; rows: string[][] } | { kind: "message"; message: string } | { kind: "error"; message: string } | null
  >(null);
  const [tables, setTables] = useState<string[] | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [columnsByTable, setColumnsByTable] = useState<Record<string, ColumnInfo[]>>({});

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const stepsQuery = trpc.capstone.getSteps.useQuery({ trackSlug });
  const stepDefs = stepsQuery.data ?? [];

  const projectQuery = trpc.capstone.getProject.useQuery({ trackSlug });
  const project = projectQuery.data;

  // Seed the editor from the project's stub exactly once, as soon as it
  // resolves — never again after, so a background refetch can't clobber the
  // learner's in-progress edits.
  const stubSeededRef = useRef(false);
  useEffect(() => {
    if (project && !stubSeededRef.current) {
      stubSeededRef.current = true;
      setCode(project.stub);
    }
  }, [project]);

  const {
    sessionId,
    session,
    dbStatus,
    start,
    isStarting,
    startError,
    verifyStep,
    verifyError,
    isVerifying,
    deployCode,
    isDeploying,
    runQuery,
    isRunningQuery,
  } = useCapstoneSession(enrollment?.id ?? "");

  const steps = stepDefs.map((def) => ({
    stepNumber: def.stepNumber,
    title: def.title,
    status: (
      session?.stepCompletions?.some((sc: { stepNumber: number }) => sc.stepNumber === def.stepNumber)
        ? "completed"
        : session && session.currentStep === def.stepNumber
          ? "current"
          : "locked"
    ) as "locked" | "current" | "completed",
  }));

  const selectedDef = stepDefs.find((d) => d.stepNumber === selectedStep) ?? null;

  // Feeds SqlEditor's autocomplete. refreshTables() batch-fetches every
  // table's columns up front, so this is populated as soon as the tab loads.
  const editorSchema: SqlEditorSchema = Object.fromEntries(
    (tables ?? []).map((table) => [table, (columnsByTable[table] ?? []).map((c) => c.name)]),
  );

  // The workflow only records a completion (with its real http_tests) when a
  // step PASSES — a failed verify writes nothing, so there's no per-check
  // detail to show for a step that's still "current". This is real data,
  // not synthesized: once the 3s status poll picks up a completed step, its
  // stored verificationResult is exactly what verify.sh produced.
  const selectedCompletion = session?.stepCompletions?.find(
    (sc: { stepNumber: number }) => sc.stepNumber === selectedStep,
  ) as { verificationResult?: { http_tests?: HttpTestResult[] } } | undefined;
  const verificationResults = selectedCompletion?.verificationResult?.http_tests ?? null;

  function handleStepClick(stepNumber: number) {
    setSelectedStep((prev) => (prev === stepNumber ? null : stepNumber));
  }

  async function handleDeploy() {
    setCompileLog(null);
    setComplexity(null);
    const result = await deployCode(code);
    if (!result) return;
    if ("error" in result) {
      setCompileLog(`Deploy failed: ${result.error}`);
      return;
    }
    setCompileLog(result.compileLog || "(no output)");
    setComplexity(result.complexity ?? null);
  }

  async function handleRunQuery() {
    setQueryResult(null);
    const result = await runQuery(sql);
    if (result) setQueryResult(result);
  }

  const refreshTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const result = await runQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
      );
      if (result?.kind === "error") return; // leave the last known table list in place
      const tableNames = result?.kind === "rows" ? result.rows.map((r) => r[0]!) : [];
      setTables(tableNames);

      // Batch-fetch every table's columns in one query so autocomplete has
      // real column names immediately, not only for tables the learner has
      // manually expanded in the sidebar.
      if (tableNames.length > 0) {
        const allColumns = await runQuery(
          "SELECT table_name, column_name, data_type FROM information_schema.columns " +
            "WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;",
        );
        if (allColumns?.kind === "rows") {
          const grouped: Record<string, ColumnInfo[]> = {};
          for (const [table, name, type] of allColumns.rows) {
            (grouped[table!] ??= []).push({ name: name!, type: type! });
          }
          setColumnsByTable(grouped);
        }
      } else {
        setColumnsByTable({});
      }
    } finally {
      setIsLoadingTables(false);
    }
  }, [runQuery]);

  // Auto-load the table list once the session's database is actually usable.
  useEffect(() => {
    if (dbStatus === "connected" && tables === null) {
      void refreshTables();
    }
  }, [dbStatus, tables, refreshTables]);

  async function toggleTable(table: string) {
    if (expandedTable === table) {
      setExpandedTable(null);
      return;
    }
    setExpandedTable(table);
    if (!columnsByTable[table]) {
      const result = await runQuery(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${sqlStringLiteral(table)} ORDER BY ordinal_position;`,
      );
      if (result?.kind === "rows") {
        setColumnsByTable((prev) => ({
          ...prev,
          [table]: result.rows.map((r) => ({ name: r[0]!, type: r[1]! })),
        }));
      }
    }
  }

  function useTableInQuery(table: string) {
    setSql(`SELECT * FROM ${sqlIdent(table)} LIMIT 100;`);
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          {project ? `${project.title} Capstone` : "Capstone"}
        </h1>
      </header>

      {projectQuery.isSuccess && project === null ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This track doesn't have a capstone project yet.
          </p>
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: the ticket board */}
        <aside className="w-72 shrink-0 overflow-auto border-r border-[var(--color-border-subtle)] p-5 flex flex-col gap-4">
          <DatabaseStatusPanel
            status={dbStatus}
            expiresAt={session?.dbExpiresAt ? new Date(session.dbExpiresAt) : null}
          />
          {startError && (
            <p className="rounded-lg border border-[var(--color-status-error)] bg-[var(--color-status-error-subtle)] px-3 py-2 text-xs text-[var(--color-status-error)]">
              {startError}
            </p>
          )}
          {!sessionId ? (
            <button
              onClick={() => void start()}
              disabled={isStarting}
              className="rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
            >
              {isStarting ? "Starting…" : "Start session"}
            </button>
          ) : (
            <CapstoneStepList
              steps={steps}
              totalSteps={stepDefs.length}
              selectedStep={selectedStep}
              onStepClick={handleStepClick}
            />
          )}
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Ticket detail panel (shown when a step is selected) */}
          {selectedDef && (
            <div className="shrink-0 overflow-auto border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-5 max-h-80">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Step {selectedDef.stepNumber} — {selectedDef.title}
                </h2>
                <div className="flex shrink-0 items-center gap-3">
                  {sessionId && (
                    <button
                      onClick={() => void verifyStep(selectedDef.stepNumber)}
                      disabled={isVerifying || dbStatus !== "connected"}
                      className="rounded-lg bg-[var(--color-interactive-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
                    >
                      {isVerifying ? "Verifying…" : `Verify step ${selectedDef.stepNumber}`}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
                    aria-label="Close instructions"
                  >
                    ✕ close
                  </button>
                </div>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)] [&_code]:rounded [&_code]:bg-[var(--color-surface-overlay)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-[var(--color-surface-overlay)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedDef.instructions}</ReactMarkdown>
              </div>
              <div className="mt-3">
                {verifyError && (
                  <p className="mb-2 rounded-lg bg-[var(--color-status-error-subtle)] px-3 py-2 text-xs text-[var(--color-status-error-text)]">
                    {verifyError}
                  </p>
                )}
                <VerificationChecklist results={verificationResults} isVerifying={isVerifying} />
              </div>
            </div>
          )}

          {/* Code / Database workspace */}
          <div className="flex flex-1 flex-col overflow-hidden p-6">
            <Tabs
              tabs={[
                { id: "code", label: "Code" },
                { id: "database", label: "Database" },
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as "code" | "database")}
            >
              {activeTab === "code" ? (
                <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                  <CodeEditor value={code} onChange={setCode} onRun={() => void handleDeploy()} {...(project ? { language: project.language } : {})} />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => void handleDeploy()}
                      disabled={isDeploying || !sessionId || dbStatus !== "connected"}
                      className="rounded-lg bg-[var(--color-interactive-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-secondary-text)] border border-[var(--color-border-default)] disabled:opacity-50"
                    >
                      {isDeploying ? "Deploying…" : "Deploy"}
                    </button>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Deploys your code to your session's live server (port 8080), replacing whatever was running before.
                    </p>
                  </div>
                  {complexity && (
                    <div
                      title={complexity.basis}
                      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]"
                    >
                      Time: {complexity.time} · Space: {complexity.space}{" "}
                      <span className="text-[var(--color-text-disabled)]">(estimated)</span>
                    </div>
                  )}
                  {compileLog !== null && (
                    <pre className="flex-1 overflow-auto rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-3 text-xs font-mono text-[var(--color-text-primary)] whitespace-pre-wrap">
                      {compileLog || "(no output)"}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  {/* Schema browser */}
                  <div className="w-56 shrink-0 overflow-auto border-r border-[var(--color-border-subtle)] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Tables
                      </span>
                      <button
                        onClick={() => void refreshTables()}
                        disabled={isLoadingTables || dbStatus !== "connected"}
                        className="text-xs text-[var(--color-text-link)] hover:underline disabled:opacity-50"
                      >
                        Refresh
                      </button>
                    </div>
                    {isLoadingTables && tables === null ? (
                      <p className="text-xs text-[var(--color-text-disabled)]">Loading…</p>
                    ) : !tables || tables.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-disabled)]">
                        No tables yet — deploy code that creates one.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-0.5">
                        {tables.map((table) => (
                          <li key={table}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => void toggleTable(table)}
                                className="flex-1 truncate rounded px-2 py-1.5 text-left text-xs font-mono text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
                              >
                                {expandedTable === table ? "▾" : "▸"} {table}
                              </button>
                              <button
                                onClick={() => useTableInQuery(table)}
                                title={`SELECT * FROM ${table} LIMIT 100`}
                                className="shrink-0 px-1.5 text-xs text-[var(--color-text-link)] hover:underline"
                              >
                                use
                              </button>
                            </div>
                            {expandedTable === table && (
                              <ul className="ml-4 border-l border-[var(--color-border-subtle)] pl-2">
                                {(columnsByTable[table] ?? []).map((col) => (
                                  <li key={col.name} className="py-0.5 text-xs font-mono text-[var(--color-text-secondary)]">
                                    {col.name} <span className="text-[var(--color-text-disabled)]">{col.type}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Query editor + results */}
                  <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Run any SQL against your session's own isolated database.
                    </p>
                    <SqlEditor
                      value={sql}
                      onChange={setSql}
                      onRun={() => void handleRunQuery()}
                      schema={editorSchema}
                    />
                    <div>
                      <button
                        onClick={() => void handleRunQuery()}
                        disabled={isRunningQuery || !sessionId || dbStatus !== "connected"}
                        className="rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
                      >
                        {isRunningQuery ? "Running…" : "Run query"}
                      </button>
                    </div>
                    <SqlResultsGrid result={queryResult} isRunning={isRunningQuery} />
                  </div>
                </div>
              )}
            </Tabs>
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
