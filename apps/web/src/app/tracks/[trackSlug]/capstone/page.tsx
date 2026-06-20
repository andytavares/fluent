"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useCapstoneSession } from "@/hooks/use-capstone-session";
import { CapstoneStepList, DatabaseStatusPanel, CodeEditor, OutputPane } from "@fluent/ui";
import { useState } from "react";
import { useSubmission } from "@/hooks/use-submission";

export default function CapstonePage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [code, setCode] = useState("package main\n\n// Build your Go CRUD API here\n");

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const { sessionId, session, dbStatus, start, isStarting, startError } = useCapstoneSession(
    enrollment?.id ?? "",
  );

  const { state: runState, lines, exitCode, runtimeMs, submit } = useSubmission({
    conceptId: "",
    enrollmentId: enrollment?.id ?? "",
  });

  const steps = Array.from({ length: 6 }, (_, i) => ({
    stepNumber: i + 1,
    title: `Step ${i + 1}`,
    status: (
      session?.stepCompletions?.some((sc: { stepNumber: number }) => sc.stepNumber === i + 1)
        ? "completed"
        : session && session.currentStep === i + 1
          ? "current"
          : "locked"
    ) as "locked" | "current" | "completed",
  }));

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          Go CRUD API Capstone
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
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
            <CapstoneStepList steps={steps} totalSteps={6} />
          )}
        </aside>

        <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <CodeEditor
            value={code}
            onChange={setCode}
            onRun={() => void submit(code, false)}
          />
          <OutputPane
            state={runState === "idle" ? "idle" : runState === "streaming" ? "streaming" : runState === "complete" ? "complete" : "error"}
            lines={lines}
            {...(exitCode !== null && exitCode !== undefined ? { exitCode } : {})}
            {...(runtimeMs !== null && runtimeMs !== undefined ? { runtimeMs } : {})}
          />
        </div>
      </div>
    </main>
  );
}
