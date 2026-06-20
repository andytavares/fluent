# ADR-004: Code Editor

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use CodeMirror 6 for the in-browser code editor.

## Motivation

Every concept lesson and test-out challenge requires an embedded code editor with Go syntax highlighting, keyboard shortcuts, and a reset-to-stub control (FR-010, FR-016).

## Rationale

CodeMirror 6 is TypeScript-first, highly composable, and has a minimal bundle footprint. Its extension system is purely functional (extensions are values). Supports Go via Lezer grammar extensions. Active multi-maintainer community.

## Alternatives Considered

- **Monaco Editor**: ~5 MB bundle; requires web worker setup; Go LSP integration adds significant complexity. Right for a full IDE, disproportionate for a teaching REPL.
- **Ace Editor**: Older codebase, less active maintenance, less clean React integration.
