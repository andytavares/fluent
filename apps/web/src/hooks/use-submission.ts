"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

type SubmissionState = "idle" | "submitting" | "streaming" | "complete" | "error";
type SubmissionKind = "lesson" | "test_out" | "placement";

interface OutputLine {
  type: "stdout" | "stderr" | "result";
  data?: string;
  exit_code?: number;
  runtime_ms?: number;
  timed_out?: boolean;
}

export interface TraceFrame {
  label?: string;
  state?: Record<string, unknown>;
  highlights?: {
    arrays?: Record<string, number[]>;
    nodes?: string[];
  };
}

export interface CompletionMeta {
  isSuite: boolean;
  kind: SubmissionKind;
}

interface UseSubmissionOptions {
  conceptId: string;
  enrollmentId: string;
  language?: string;
  /**
   * Called with the server's verdict once the submission is finalized. The
   * meta is bound to the submission that completed — not to component state —
   * so overlapping runs can't misroute their verdicts.
   */
  onComplete?: (passed: boolean, meta: CompletionMeta) => void;
}

export function useSubmission({ conceptId, enrollmentId, language = "go", onComplete }: UseSubmissionOptions) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();
  const [lastIsSuite, setLastIsSuite] = useState(false);
  const [traceFrames, setTraceFrames] = useState<TraceFrame[]>([]);

  const createSubmission = trpc.submissions.createSubmission.useMutation();
  const doCompleteSubmission = trpc.submissions.completeSubmission.useMutation();

  const submit = useCallback(
    async (code: string, isSuite = false, kind: SubmissionKind = "lesson") => {
      setState("submitting");
      setLines([]);
      setExitCode(undefined);
      setRuntimeMs(undefined);
      setLastIsSuite(isSuite);
      setTraceFrames([]);

      try {
        const { submissionId, streamToken } = await createSubmission.mutateAsync({
          conceptId,
          ...(enrollmentId ? { enrollmentId } : {}),
          code,
          language,
          isSuite,
          kind,
        });

        setState("streaming");

        const es = new EventSource(`/api/stream/${streamToken}`);

        es.addEventListener("stdout", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data) as { data: string };
          setLines((prev) => [...prev, { type: "stdout", data: data.data }]);
        });

        es.addEventListener("trace", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data) as { frames: TraceFrame[] };
          setTraceFrames(data.frames ?? []);
        });

        es.addEventListener("stderr", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data) as { data: string };
          setLines((prev) => [...prev, { type: "stderr", data: data.data }]);
        });

        es.addEventListener("result", (e: MessageEvent<string>) => {
          const result = JSON.parse(e.data) as { exit_code: number; runtime_ms: number; timed_out: boolean };
          setExitCode(result.exit_code);
          setRuntimeMs(result.runtime_ms);
          setState("complete");
          es.close();

          // The server owns the verdict: finalize reads the worker's result
          // from Redis, scores it, and advances concept state.
          void doCompleteSubmission
            .mutateAsync({ submissionId })
            .then(({ passed }) => onComplete?.(passed, { isSuite, kind }))
            .catch(() => setState("error"));
        });

        es.onerror = () => {
          setState("error");
          es.close();
        };
      } catch {
        setState("error");
      }
    },
    [conceptId, enrollmentId, language, createSubmission, doCompleteSubmission, onComplete],
  );

  return { state, lines, exitCode, runtimeMs, isSuite: lastIsSuite, traceFrames, submit };
}
