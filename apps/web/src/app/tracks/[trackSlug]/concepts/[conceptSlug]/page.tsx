"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeEditor, OutputPane, TestOutModal, CongratsModal, TracePanel, AlgorithmVisualizer } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";
import { useSubmission } from "@/hooks/use-submission";

function countPassedTests(lines: { type: string; data?: string }[]): number {
  const text = lines.map((l) => l.data ?? "").join("\n");
  return (text.match(/^--- PASS:/gm) ?? []).length;
}

function extractTaskPrompt(instructions: string): string {
  const match = instructions.match(/## The task\n([\s\S]*?)(?=\n## |$)/);
  return match?.[1]?.trim() ?? "";
}

export default function LessonPage() {
  const { trackSlug, conceptSlug } = useParams<{ trackSlug: string; conceptSlug: string }>();
  const router = useRouter();
  const [testOutOpen, setTestOutOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [code, setCode] = useState("");
  // null = no testout result yet; object = result after testout submission completes
  const [testOutResult, setTestOutResult] = useState<{ passed: boolean } | null>(null);
  const isTestOutRef = useRef(false);

  const conceptQuery = trpc.tracks.getConceptLesson.useQuery({ trackSlug, conceptSlug });

  const enrollmentsQuery = trpc.enrollments.listEnrollments.useQuery();
  const enrollment = enrollmentsQuery.data?.find((e) => e.track.slug === trackSlug);

  const completeSubmission = trpc.submissions.completeSubmission.useMutation();

  useEffect(() => {
    if (conceptQuery.data && !code) {
      const stub =
        conceptQuery.data.stub ||
        `package main\n\nfunc main() {\n\t// ${conceptQuery.data.title}\n}\n`;
      setCode(stub);
    }
  }, [conceptQuery.data, code]);

  const { state, lines, exitCode, runtimeMs, isSuite, traceFrames, submit } = useSubmission({
    conceptId: conceptQuery.data?.id ?? "",
    enrollmentId: enrollment?.id ?? "",
    language: conceptQuery.data?.language,
    onComplete: (passed) => {
      if (isTestOutRef.current) {
        setTestOutResult({ passed });
        isTestOutRef.current = false;
        return;
      }
      if (passed && isSuite) {
        setCongratsOpen(true);
      }
    },
  });

  // Also catch isSuite=true runs that complete with exitCode 0 (onComplete fires before isSuite state propagates)
  useEffect(() => {
    if (state === "complete" && exitCode === 0 && isSuite && !isTestOutRef.current) {
      setCongratsOpen(true);
    }
  }, [state, exitCode, isSuite]);

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
          <div className="prose prose-sm prose-invert max-w-none
            text-[var(--color-text-secondary)]
            [&_h1]:text-[var(--color-text-primary)] [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-0
            [&_h2]:text-[var(--color-text-primary)] [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
            [&_h3]:text-[var(--color-text-primary)] [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-1
            [&_p]:leading-relaxed [&_p]:mb-3
            [&_strong]:text-[var(--color-text-primary)]
            [&_code]:rounded [&_code]:bg-[var(--color-bg-subtle)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_code]:break-words
            [&_pre]:rounded-lg [&_pre]:bg-[var(--color-bg-subtle)] [&_pre]:p-3 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:my-3
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:break-normal [&_pre_code]:whitespace-pre
            [&_ul]:my-2 [&_ul]:pl-4 [&_li]:mb-1
            [&_ol]:my-2 [&_ol]:pl-4
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-xs
            [&_th]:border [&_th]:border-[var(--color-border-subtle)] [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-[var(--color-text-primary)] [&_th]:bg-[var(--color-bg-subtle)]
            [&_td]:border [&_td]:border-[var(--color-border-subtle)] [&_td]:px-2.5 [&_td]:py-1.5
          ">
            {concept.instructions
              ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{concept.instructions}</ReactMarkdown>
              : <p>Complete the exercise in the editor.</p>
            }
          </div>
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
          stub: concept.stub ?? `// ${concept.title}\n`,
          taskPrompt,
        }}
        onSubmit={(testCode) => {
          isTestOutRef.current = true;
          void submit(testCode, true);
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
