import type { TraceFrame } from "@fluent/execution-contract";

// The one SSE client for execution result streams. Both the lesson
// submission hook and the visualizer sandbox consume streams through this —
// the event names and payload shapes are the sandbox streamer's wire format.

export interface ExecutionResultEvent {
  exit_code: number;
  runtime_ms: number;
  timed_out: boolean;
}

export interface ExecutionStreamHandlers {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  onTrace?: (frames: TraceFrame[]) => void;
  onResult?: (result: ExecutionResultEvent) => void;
  onError?: () => void;
}

/** Opens the stream and dispatches events; returns a close function. */
export function consumeExecutionStream(
  streamToken: string,
  handlers: ExecutionStreamHandlers,
): () => void {
  const es = new EventSource(`/api/stream/${streamToken}`);

  es.addEventListener("stdout", (e: MessageEvent<string>) => {
    const { data } = JSON.parse(e.data) as { data: string };
    handlers.onStdout?.(data);
  });

  es.addEventListener("stderr", (e: MessageEvent<string>) => {
    const { data } = JSON.parse(e.data) as { data: string };
    handlers.onStderr?.(data);
  });

  es.addEventListener("trace", (e: MessageEvent<string>) => {
    const { frames } = JSON.parse(e.data) as { frames: TraceFrame[] };
    handlers.onTrace?.(frames ?? []);
  });

  es.addEventListener("result", (e: MessageEvent<string>) => {
    const result = JSON.parse(e.data) as ExecutionResultEvent;
    es.close();
    handlers.onResult?.(result);
  });

  es.onerror = () => {
    es.close();
    handlers.onError?.();
  };

  return () => es.close();
}
