# ADR-005: Exercise Content Storage

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Exercises live as Git-embedded folders in the monorepo (`content/`), compiled to a static JSON manifest at CI time and embedded in the API at build time.

## Motivation

Content must be authorable via PR (FR-035), validated by CI linter (FR-036, FR-037), and live to learners without platform code changes on merge (FR-040). Preview environments must show new content exactly as learners will see it (FR-039).

## Rationale

Git-embedded content means: (1) PR-based authoring workflow is the natural model, (2) the linter runs in CI on every PR, (3) preview environments are just CI deployments of the branch, (4) no runtime Git API calls — content is compiled to a JSON manifest at build time and embedded. Adding a new track requires only a new top-level folder.

## Alternatives Considered

- **Runtime GitHub API reads**: Adds latency per page load and a third-party dependency in the hot path.
- **Exercises in PostgreSQL**: Requires a content migration pipeline; loses the Git-PR authoring workflow; complicates branch preview environments.
- **Separate content repository**: Adds cross-repo coordination for content+platform changes without benefits at v1 scale.
