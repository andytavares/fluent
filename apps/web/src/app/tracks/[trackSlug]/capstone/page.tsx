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
} from "@fluent/ui";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HttpTestResult {
  method: string;
  path: string;
  status: number;
  passed: boolean;
  response_body?: unknown;
}

const DEFAULT_STUB = "package main\n\n// Build your Go CRUD API here.\n// Listen on :8080 and read DATABASE_URL from your environment.\n";

export default function CapstonePage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [code, setCode] = useState(DEFAULT_STUB);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "database">("code");
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [sql, setSql] = useState("SELECT * FROM users;");
  const [queryResult, setQueryResult] = useState<
    { kind: "rows"; columns: string[]; rows: string[][] } | { kind: "message"; message: string } | { kind: "error"; message: string } | null
  >(null);

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const stepsQuery = trpc.capstone.getSteps.useQuery({ trackSlug });
  const stepDefs = stepsQuery.data ?? [];

  const {
    sessionId,
    session,
    dbStatus,
    start,
    isStarting,
    startError,
    verifyStep,
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
    const result = await deployCode(code);
    if (result) setCompileLog(result.compileLog || "(no output)");
  }

  async function handleRunQuery() {
    setQueryResult(null);
    const result = await runQuery(sql);
    if (result) setQueryResult(result);
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          Go CRUD API Capstone
        </h1>
      </header>

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
                  <CodeEditor value={code} onChange={setCode} onRun={() => void handleDeploy()} />
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
                  {compileLog !== null && (
                    <pre className="flex-1 overflow-auto rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-3 text-xs font-mono text-[var(--color-text-primary)] whitespace-pre-wrap">
                      {compileLog || "(no output)"}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Run any SQL against your session's own isolated database.
                  </p>
                  <textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    rows={4}
                    spellCheck={false}
                    className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-3 font-mono text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-interactive-primary)]"
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
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
