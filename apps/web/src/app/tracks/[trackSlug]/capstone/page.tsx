"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useCapstoneSession } from "@/hooks/use-capstone-session";
import { CapstoneStepList, DatabaseStatusPanel, CodeEditor, OutputPane } from "@fluent/ui";
import { useState, useCallback } from "react";
import { consumeExecutionStream } from "@/lib/execution-stream";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StepDef {
  stepNumber: number;
  title: string;
  instructions: string;
}

const STEP_DEFS: StepDef[] = [
  {
    stepNumber: 1,
    title: "Health endpoint",
    instructions: `## Step 1 — GET /health

Make a handler at \`GET /health\` that returns a JSON response:

\`\`\`json
{ "status": "ok" }
\`\`\`

The test will hit this endpoint and assert status 200 with that exact body.

**Tips**
- Use \`encoding/json\` or your framework's JSON helper.
- No database needed yet — this is a smoke test for your server setup.`,
  },
  {
    stepNumber: 2,
    title: "POST /users",
    instructions: `## Step 2 — POST /users

Create a user and persist it in the database. Accept JSON:

\`\`\`json
{ "name": "Alice", "email": "alice@example.com" }
\`\`\`

Return **201 Created** with the inserted row including its generated \`id\` and \`created_at\` fields.

**Tips**
- Validate that both \`name\` and \`email\` are present; return 400 if missing.
- Use the \`DATABASE_URL\` env var to connect (it's already set in your session).
- Suggested table: \`CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())\`.`,
  },
  {
    stepNumber: 3,
    title: "GET /users/:id",
    instructions: `## Step 3 — GET /users/:id

Fetch a single user by their integer \`id\`.

- Return **200** with the user object if found.
- Return **404** with \`{ "error": "not found" }\` if the id doesn't exist.

**Tips**
- Parse the path param as an integer; return 400 for non-numeric ids.
- Reuse the DB connection pool you created in Step 2.`,
  },
  {
    stepNumber: 4,
    title: "PUT /users/:id",
    instructions: `## Step 4 — PUT /users/:id

Update an existing user's \`name\` and/or \`email\`.

Accept a partial body (only send fields that should change). Return the updated record on **200**, or **404** if the user doesn't exist.

**Tips**
- Build the UPDATE statement dynamically based on which fields are present.
- Return the full updated row, not just the fields that changed.`,
  },
  {
    stepNumber: 5,
    title: "DELETE /users/:id",
    instructions: `## Step 5 — DELETE /users/:id

Delete a user by id.

- Return **204 No Content** on success.
- Return **404** if the user doesn't exist.

**Tips**
- Check the number of rows affected; if 0, the id wasn't found.
- A 204 response must have an empty body.`,
  },
  {
    stepNumber: 6,
    title: "GET /users (paginated)",
    instructions: `## Step 6 — GET /users with pagination

List all users with cursor-based or offset pagination via query params:

- \`?page=1&limit=10\` (default: page 1, limit 10, max limit 100)

Return:

\`\`\`json
{
  "users": [...],
  "total": 42,
  "page": 1,
  "limit": 10
}
\`\`\`

**Tips**
- Use \`OFFSET (page - 1) * limit\` and a separate \`COUNT(*)\` query for total.
- Clamp limit to 100 max to prevent abuse.
- Order by \`created_at DESC\` so newest users appear first.`,
  },
];

type RunState = "idle" | "running" | "complete" | "error";
interface OutputLine {
  type: "stdout" | "stderr";
  data: string;
}

export default function CapstonePage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [code, setCode] = useState("package main\n\n// Build your Go CRUD API here\n");
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const { sessionId, session, dbStatus, start, isStarting, startError, verifyStep, isVerifying } =
    useCapstoneSession(enrollment?.id ?? "");

  const runSandbox = trpc.submissions.runSandbox.useMutation();

  // Scratch-run the learner's code (capstone verification is separate: the
  // Verify button signals the workflow, which runs the step's verify.sh).
  const run = useCallback(async () => {
    setRunState("running");
    setLines([]);
    setExitCode(undefined);
    setRuntimeMs(undefined);
    try {
      const { streamToken } = await runSandbox.mutateAsync({ code, language: "go" });
      consumeExecutionStream(streamToken, {
        onStdout: (data) => setLines((prev) => [...prev, { type: "stdout", data }]),
        onStderr: (data) => setLines((prev) => [...prev, { type: "stderr", data }]),
        onResult: (result) => {
          setExitCode(result.exit_code);
          setRuntimeMs(result.runtime_ms);
          setRunState("complete");
        },
        onError: () => setRunState("error"),
      });
    } catch {
      setRunState("error");
    }
  }, [code, runSandbox]);

  const steps = STEP_DEFS.map((def) => ({
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

  const selectedDef = STEP_DEFS.find((d) => d.stepNumber === selectedStep) ?? null;

  function handleStepClick(stepNumber: number) {
    setSelectedStep((prev) => (prev === stepNumber ? null : stepNumber));
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          Go CRUD API Capstone
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
              totalSteps={6}
              selectedStep={selectedStep}
              onStepClick={handleStepClick}
            />
          )}
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Step instructions panel (shown when a step is selected) */}
          {selectedDef && (
            <div className="shrink-0 overflow-auto border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-5 max-h-64">
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
            </div>
          )}

          {/* Editor + output */}
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={() => void run()}
            />
            <OutputPane
              state={runState === "idle" ? "idle" : runState === "running" ? "streaming" : runState === "complete" ? "complete" : "error"}
              lines={lines}
              {...(exitCode !== undefined ? { exitCode } : {})}
              {...(runtimeMs !== undefined ? { runtimeMs } : {})}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

