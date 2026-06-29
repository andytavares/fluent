"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useCapstoneSession } from "@/hooks/use-capstone-session";
import { CapstoneStepList, DatabaseStatusPanel, CodeEditor, OutputPane } from "@fluent/ui";
import { useState } from "react";
import { useSubmission } from "@/hooks/use-submission";

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

export default function CapstonePage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [code, setCode] = useState("package main\n\n// Build your Go CRUD API here\n");
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const { sessionId, session, dbStatus, start, isStarting, startError } = useCapstoneSession(
    enrollment?.id ?? "",
  );

  const { state: runState, lines, exitCode, runtimeMs, submit } = useSubmission({
    conceptId: "",
    enrollmentId: enrollment?.id ?? "",
  });

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
                <button
                  onClick={() => setSelectedStep(null)}
                  className="shrink-0 text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
                  aria-label="Close instructions"
                >
                  ✕ close
                </button>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)] [&_code]:rounded [&_code]:bg-[var(--color-surface-overlay)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-[var(--color-surface-overlay)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                <MarkdownContent content={selectedDef.instructions} />
              </div>
            </div>
          )}

          {/* Editor + output */}
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
      </div>
    </main>
  );
}

/** Minimal markdown renderer — handles headings, code blocks, inline code, bold, lists. */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      elements.push(
        <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-[var(--color-surface-overlay)] p-3">
          <code className="font-mono text-xs text-[var(--color-text-primary)]" data-lang={lang}>
            {codeLines.join("\n")}
          </code>
        </pre>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mb-1 mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="mb-1 text-xs font-semibold text-[var(--color-text-secondary)]">
          {renderInline(line)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-xs text-[var(--color-text-secondary)]">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="rounded bg-[var(--color-surface-overlay)] px-1 py-0.5 font-mono text-xs text-[var(--color-text-primary)]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-semibold text-[var(--color-text-primary)]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
