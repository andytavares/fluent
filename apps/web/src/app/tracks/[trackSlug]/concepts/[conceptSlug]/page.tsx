"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CodeEditor, LessonMarkdown, OutputPane, TestOutModal, CongratsModal, TracePanel, AlgorithmVisualizer } from "@fluent/ui";
import { extractTaskPrompt } from "@fluent/content-config/task-prompt";
import { trpc } from "@/lib/trpc/client";
import { useSubmission } from "@/hooks/use-submission";

function countPassedTests(lines: { type: string; data?: string }[]): number {
  const text = lines.map((l) => l.data ?? "").join("\n");
  return (text.match(/^--- PASS:/gm) ?? []).length;
}

export default function LessonPage() {
  const { trackSlug, conceptSlug } = useParams<{ trackSlug: string; conceptSlug: string }>();
  const router = useRouter();
  const [testOutOpen, setTestOutOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [code, setCode] = useState("");
  // null = no testout result yet; object = result after testout submission completes
  const [testOutResult, setTestOutResult] = useState<{ passed: boolean } | null>(null);

  const conceptQuery = trpc.tracks.getConceptLesson.useQuery({ trackSlug, conceptSlug });

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  useEffect(() => {
    if (conceptQuery.data && !code) {
      const stub =
        conceptQuery.data.stub ||
        `package main\n\nfunc main() {\n\t// ${conceptQuery.data.title}\n}\n`;
      setCode(stub);
    }
  }, [conceptQuery.data, code]);

  const { state, lines, exitCode, runtimeMs, isSuite, traceFrames, complexity, submit } = useSubmission({
    conceptId: conceptQuery.data?.id ?? "",
    enrollmentId: enrollment?.id ?? "",
    language: conceptQuery.data?.language,
    // Fires with the server's verdict; the meta is bound to the submission
    // that completed, so a test-out run can't misroute into the congrats flow.
    onComplete: (passed, meta) => {
      if (meta.kind === "test_out") {
        setTestOutResult({ passed });
        return;
      }
      if (passed && meta.isSuite) {
        setCongratsOpen(true);
      }
    },
  });

  if (conceptQuery.isLoading) {
    return <div className="p-8 text-[var(--color-text-secondary)]">Loading…</div>;
  }

  const concept = conceptQuery.data;
  if (!concept) return null;

  const nextConceptSlug = concept.nextConceptSlug;
  const passCount = countPassedTests(lines);
  const taskPrompt = concept.instructions ? extractTaskPrompt(concept.instructions) : "";

  function handleNextLesson() {
    setCongratsOpen(false);
    setTestOutOpen(false);
    if (nextConceptSlug) {
      router.push(`/tracks/${trackSlug}/concepts/${nextConceptSlug}`);
    } else {
      router.push(`/tracks/${trackSlug}`);
    }
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          {concept.title}
        </h1>
        <div className="flex gap-2">
          {concept.hasTestout && (
            <button
              onClick={() => { setTestOutResult(null); setTestOutOpen(true); }}
              className="rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Test out →
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Instructions panel */}
        <div className="w-96 shrink-0 overflow-auto border-r border-[var(--color-border-subtle)] p-6">
          <LessonMarkdown>{concept.instructions || "Complete the exercise in the editor."}</LessonMarkdown>
        </div>

        {/* Editor + output panel */}
        <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <CodeEditor
            value={code}
            onChange={setCode}
            onRun={() => void submit(code, false)}
          />

          <OutputPane
            state={state === "idle" ? "idle" : state === "streaming" ? "streaming" : state === "complete" ? "complete" : "error"}
            lines={lines}
            isSuite={isSuite}
            complexity={complexity}
            {...(exitCode !== null && exitCode !== undefined ? { exitCode } : {})}
            {...(runtimeMs !== null && runtimeMs !== undefined ? { runtimeMs } : {})}
          />

          <AlgorithmVisualizer conceptSlug={conceptSlug} title={concept.title} />

          {traceFrames.length > 0 && (
            <TracePanel frames={traceFrames} />
          )}

          <div className="flex gap-3">
            <button
              onClick={() => void submit(code, false)}
              disabled={state === "streaming" || state === "submitting" || !code || !conceptQuery.data}
              className="rounded-lg bg-[var(--color-interactive-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-secondary-text)] border border-[var(--color-border-default)] disabled:opacity-50"
            >
              Run (Ctrl+Enter)
            </button>
            <button
              onClick={() => void submit(code, true)}
              disabled={state === "streaming" || state === "submitting" || !code || !conceptQuery.data}
              className="rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
            >
              Submit & check tests
            </button>
          </div>
        </div>
      </div>

      <TestOutModal
        open={testOutOpen}
        onClose={() => setTestOutOpen(false)}
        concept={{
          title: concept.title,
          stub: concept.testoutStub || concept.stub || `// ${concept.title}\n`,
          taskPrompt,
        }}
        onSubmit={(testCode) => {
          void submit(testCode, true, "test_out");
        }}
        onEscape={() => setTestOutOpen(false)}
        isSubmitting={state === "streaming" || state === "submitting"}
        result={testOutResult}
        onNext={handleNextLesson}
      />

      <CongratsModal
        open={congratsOpen}
        passCount={passCount}
        runtimeMs={runtimeMs}
        hasNext={!!nextConceptSlug}
        onNext={handleNextLesson}
        onClose={() => setCongratsOpen(false)}
      />
    </main>
  );
}
