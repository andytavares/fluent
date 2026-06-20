# ADR-001: Monorepo Tooling

**Date**: 2026-06-19 | **Status**: Accepted

## Decision

Use pnpm workspaces + Turborepo for the Fluent monorepo.

## Motivation

The platform has multiple deployable services (`apps/web`, `apps/api`, `apps/sandbox`, `apps/capstone-runner`) and one shared library (`packages/ui` — Rosetta design system). Changes to `@fluent/ui` must be buildable and testable in isolation before consuming apps rebuild. A monorepo with proper workspace tooling enforces this dependency graph automatically.

## Rationale

pnpm's symlink model eliminates phantom dependencies. Turborepo adds incremental build caching and a dependency task graph without a separate package manager. The combination is Vercel's documented recommendation for Next.js monorepos.

## Alternatives Considered

- **Nx**: Significantly more configuration; overkill for this repo size.
- **Separate repos**: Cross-repo coordination required for every `@fluent/ui` change; PR preview environments become complex.
