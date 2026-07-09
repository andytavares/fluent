"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { TraceFrame } from "@fluent/execution-contract";
import { trpc } from "@/lib/trpc/client";
import { consumeExecutionStream } from "@/lib/execution-stream";

export type SandboxRunState = "idle" | "streaming" | "complete" | "error";

export interface SandboxOutputLine {
  type: "stdout" | "stderr";
  data: string;
}

/**
 * Scratch-runs code through submissions.runSandbox and drives the run state
 * from the execution stream. Shared by every "run untested code" surface
 * (visualizer sandbox, capstone editor). Re-running or unmounting closes any
 * in-flight stream.
 */
export function useSandboxRun(language: string) {
  const [runState, setRunState] = useState<SandboxRunState>("idle");
  const [lines, setLines] = useState<SandboxOutputLine[]>([]);
  const [traceFrames, setTraceFrames] = useState<TraceFrame[]>([]);
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();

  const runSandbox = trpc.submissions.runSandbox.useMutation();
  const closeStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => () => closeStreamRef.current?.(), []);

  const reset = useCallback(() => {
    closeStreamRef.current?.();
    setRunState("idle");
    setLines([]);
    setTraceFrames([]);
    setExitCode(undefined);
    setRuntimeMs(undefined);
  }, []);

  const run = useCallback(
    async (code: string) => {
      closeStreamRef.current?.();
      setRunState("streaming");
      setLines([]);
      setTraceFrames([]);
      setExitCode(undefined);
      setRuntimeMs(undefined);

      try {
        const { streamToken } = await runSandbox.mutateAsync({ code, language });
        closeStreamRef.current = consumeExecutionStream(streamToken, {
          onStdout: (data) => setLines((prev) => [...prev, { type: "stdout", data }]),
          onStderr: (data) => setLines((prev) => [...prev, { type: "stderr", data }]),
          onTrace: (frames) => setTraceFrames(frames),
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
    },
    [language, runSandbox],
  );

  return { runState, lines, traceFrames, exitCode, runtimeMs, run, reset };
}
