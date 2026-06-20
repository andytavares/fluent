"use client";

import { useEffect, useRef, useCallback } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  stub?: string;
  language?: string;
  readOnly?: boolean;
}

async function getLanguageExtension(language: string) {
  const { StreamLanguage } = await import("@codemirror/language");
  switch (language.toLowerCase()) {
    case "go": {
      const { go } = await import("@codemirror/legacy-modes/mode/go");
      return StreamLanguage.define(go);
    }
    case "python": {
      const { python } = await import("@codemirror/legacy-modes/mode/python");
      return StreamLanguage.define(python);
    }
    case "javascript":
    case "typescript": {
      const { javascript } = await import("@codemirror/legacy-modes/mode/javascript");
      return StreamLanguage.define(javascript);
    }
    case "rust": {
      const { rust } = await import("@codemirror/legacy-modes/mode/rust");
      return StreamLanguage.define(rust);
    }
    default: {
      const { go } = await import("@codemirror/legacy-modes/mode/go");
      return StreamLanguage.define(go);
    }
  }
}

export function CodeEditor({ value, onChange, onRun, language = "go", readOnly = false }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<unknown>(null);
  // Always holds the latest value so the async init can read it at completion time
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onRun?.();
      }
    },
    [onRun],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    void (async () => {
      const { EditorView, basicSetup } = await import("codemirror");
      const { EditorState } = await import("@codemirror/state");
      const { keymap } = await import("@codemirror/view");
      const { oneDark } = await import("@codemirror/theme-one-dark");
      const langExtension = await getLanguageExtension(language);

      if (destroyed || !containerRef.current) return;

      const view = new EditorView({
        state: EditorState.create({
          doc: valueRef.current,
          extensions: [
            basicSetup,
            oneDark,
            langExtension,
            EditorView.updateListener.of((update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString());
              }
            }),
            keymap.of([
              {
                key: "Ctrl-Enter",
                mac: "Cmd-Enter",
                run: () => {
                  onRun?.();
                  return true;
                },
              },
            ]),
            EditorState.readOnly.of(readOnly),
          ],
        }),
        parent: containerRef.current,
      });

      viewRef.current = view;
      containerRef.current.addEventListener("keydown", handleKeyDown);
    })();

    return () => {
      destroyed = true;
      if (viewRef.current) {
        (viewRef.current as { destroy: () => void }).destroy();
        viewRef.current = null;
      }
      containerRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (e.g. stub loading after query resolves) into the editor
  useEffect(() => {
    if (!viewRef.current) return;
    const view = viewRef.current as {
      state: { doc: { toString(): string } };
      dispatch: (tr: { changes: { from: number; to: number; insert: string } }) => void;
    };
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({ changes: { from: 0, to: currentDoc.length, insert: value } });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="min-h-[200px] max-h-[60vh] rounded-lg border border-[var(--color-border-default)] overflow-y-auto font-mono text-sm"
      data-testid="code-editor"
    />
  );
}
