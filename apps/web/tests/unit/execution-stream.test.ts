import { describe, it, expect, beforeEach, vi } from "vitest";
import { consumeExecutionStream } from "../../src/lib/execution-stream";

// The one SSE client — tested through a fake EventSource that captures
// listeners and lets tests emit the sandbox streamer's wire events.

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  closed = false;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, (e: { data: string }) => void>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(event: string, handler: (e: { data: string }) => void) {
    this.listeners.set(event, handler);
  }

  emit(event: string, payload: unknown) {
    this.listeners.get(event)?.({ data: JSON.stringify(payload) });
  }

  close() {
    this.closed = true;
  }
}

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
});

function lastSource(): FakeEventSource {
  return FakeEventSource.instances.at(-1)!;
}

describe("consumeExecutionStream", () => {
  it("opens the stream for the given token", () => {
    consumeExecutionStream("tok-1", {});
    expect(lastSource().url).toBe("/api/stream/tok-1");
  });

  it("dispatches stdout/stderr/trace payloads to their handlers", () => {
    const onStdout = vi.fn();
    const onStderr = vi.fn();
    const onTrace = vi.fn();
    consumeExecutionStream("tok", { onStdout, onStderr, onTrace });

    lastSource().emit("stdout", { data: "out-line" });
    lastSource().emit("stderr", { data: "err-line" });
    lastSource().emit("trace", { frames: [{ label: "f1" }] });

    expect(onStdout).toHaveBeenCalledWith("out-line");
    expect(onStderr).toHaveBeenCalledWith("err-line");
    expect(onTrace).toHaveBeenCalledWith([{ label: "f1" }]);
  });

  it("delivers the result and closes the stream", () => {
    const onResult = vi.fn();
    consumeExecutionStream("tok", { onResult });

    lastSource().emit("result", { exit_code: 0, runtime_ms: 42, timed_out: false });

    expect(onResult).toHaveBeenCalledWith({ exit_code: 0, runtime_ms: 42, timed_out: false });
    expect(lastSource().closed).toBe(true);
  });

  it("treats a missing trace frames field as an empty list", () => {
    const onTrace = vi.fn();
    consumeExecutionStream("tok", { onTrace });

    lastSource().emit("trace", {});

    expect(onTrace).toHaveBeenCalledWith([]);
  });

  it("closes and reports on stream error", () => {
    const onError = vi.fn();
    consumeExecutionStream("tok", { onError });

    lastSource().onerror?.();

    expect(onError).toHaveBeenCalled();
    expect(lastSource().closed).toBe(true);
  });

  it("returns a closer that shuts the stream (for re-runs and unmounts)", () => {
    const close = consumeExecutionStream("tok", {});

    close();

    expect(lastSource().closed).toBe(true);
  });
});
