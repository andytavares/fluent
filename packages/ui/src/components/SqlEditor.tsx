"use client";

import { useEffect, useRef, useCallback } from "react";

export interface SqlEditorSchema {
  [table: string]: string[];
}

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  /** Table → column names, for schema-aware autocomplete (from the schema browser). */
  schema?: SqlEditorSchema;
  readOnly?: boolean;
}

export function SqlEditor({ value, onChange, onRun, schema, readOnly = false }: SqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<unknown>(null);
  // Always holds the latest values so the async init (and the schema-reconfigure
  // effect below) can read them without retriggering the whole editor rebuild.
  const valueRef = useRef(value);
  valueRef.current = value;
  const schemaCompartmentRef = useRef<unknown>(null);

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
      const { EditorState, Compartment } = await import("@codemirror/state");
      const { keymap } = await import("@codemirror/view");
      const { oneDark } = await import("@codemirror/theme-one-dark");
      const { sql, PostgreSQL } = await import("@codemirror/lang-sql");

      if (destroyed || !containerRef.current) return;

      const schemaCompartment = new Compartment();
      schemaCompartmentRef.current = schemaCompartment;

      const view = new EditorView({
        state: EditorState.create({
          doc: valueRef.current,
          extensions: [
            basicSetup,
            oneDark,
            schemaCompartment.of(sql({ dialect: PostgreSQL, ...(schema ? { schema } : {}) })),
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

  // Sync external value changes (e.g. "use this table" from the schema browser)
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

  // Reconfigure autocomplete when the schema browser learns about new
  // tables/columns (e.g. after a redeploy creates a table), without
  // rebuilding the whole editor and losing cursor position/undo history.
  useEffect(() => {
    if (!viewRef.current || !schemaCompartmentRef.current) return;
    void (async () => {
      const { sql, PostgreSQL } = await import("@codemirror/lang-sql");
      const view = viewRef.current as { dispatch: (tr: unknown) => void };
      const compartment = schemaCompartmentRef.current as { reconfigure: (ext: unknown) => unknown };
      view.dispatch({
        effects: compartment.reconfigure(sql({ dialect: PostgreSQL, ...(schema ? { schema } : {}) })),
      });
    })();
  }, [schema]);

  return (
    <div
      ref={containerRef}
      className="min-h-[120px] max-h-[40vh] rounded-lg border border-[var(--color-border-default)] overflow-y-auto font-mono text-sm"
      data-testid="sql-editor"
    />
  );
}
