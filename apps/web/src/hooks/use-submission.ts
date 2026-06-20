"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

type SubmissionState = "idle" | "submitting" | "streaming" | "complete" | "error";

interface OutputLine {
  type: "stdout" | "stderr" | "result";
  data?: string;
  exit_code?: number;
  runtime_ms?: number;
  timed_out?: boolean;
}

interface UseSubmissionOptions {
  conceptId: string;
  enrollmentId: string;
  onComplete?: (passed: boolean) => void;
}

export function useSubmission({ conceptId, enrollmentId, onComplete }: UseSubmissionOptions) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();
  const [lastIsSuite, setLastIsSuite] = useState(false);

  const createSubmission = trpc.submissions.createSubmission.useMutation();
  const doCompleteSubmission = trpc.submissions.completeSubmission.useMutation();

  const submit = useCallback(
    async (code: string, isSuite = false) => {
      setState("submitting");
      setLines([]);
      setExitCode(undefined);
      setRuntimeMs(undefined);
      setLastIsSuite(isSuite);

      try {
        const { submissionId, streamToken } = await createSubmission.mutateAsync({
          conceptId,
          code,
          isSuite,
        });

        setState("streaming");

        const collectedLines: OutputLine[] = [];
        const es = new EventSource(`/api/stream/${streamToken}`);

        es.addEventListener("stdout", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data) as { data: string };
          const line: OutputLine = { type: "stdout", data: data.data };
          setLines((prev) => [...prev, line]);
          collectedLines.push(line);
        });

        es.addEventListener("stderr", (e: MessageEvent<string>) => {
          const data = JSON.parse(e.data) as { data: string };
          const line: OutputLine = { type: "stderr", data: data.data };
          setLines((prev) => [...prev, line]);
          collectedLines.push(line);
        });

        es.addEventListener("result", (e: MessageEvent<string>) => {
          const result = JSON.parse(e.data) as { exit_code: number; runtime_ms: number; timed_out: boolean };
          setExitCode(result.exit_code);
          setRuntimeMs(result.runtime_ms);
          setState("complete");
          es.close();

          const passed = result.exit_code === 0 && !result.timed_out;
          onComplete?.(passed);

          if (enrollmentId) {
            const stdout = collectedLines.filter((l) => l.type === "stdout").map((l) => l.data ?? "").join("\n");
            const stderr = collectedLines.filter((l) => l.type === "stderr").map((l) => l.data ?? "").join("\n");
            void doCompleteSubmission.mutateAsync({
              submissionId,
              enrollmentId,
              stdout,
              stderr,
              exitCode: result.exit_code,
              runtimeMs: result.runtime_ms,
              timedOut: result.timed_out,
              passed: isSuite ? passed : undefined,
            });
          }
        });

        es.onerror = () => {
          setState("error");
          es.close();
        };
      } catch {
        setState("error");
      }
    },
    [conceptId, enrollmentId, createSubmission, doCompleteSubmission, onComplete],
  );

  return { state, lines, exitCode, runtimeMs, isSuite: lastIsSuite, submit };
}
