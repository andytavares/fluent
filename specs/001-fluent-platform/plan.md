# Implementation Plan: Fluent Platform — v1

**Branch**: `001-fluent-platform` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-fluent-platform/spec.md`

---

## Summary

Fluent is an interactive coding-education platform for experienced engineers. v1 delivers a Go track with adaptive placement, an in-browser REPL (lesson + test-out), a multi-step capstone CRUD API project, and the Rosetta design system (`@fluent/ui`). The platform runs as a TypeScript monorepo: a Next.js frontend, a Fastify/tRPC API, a BullMQ-backed sandbox execution service, and a Temporal-based capstone session runner — all sharing a PostgreSQL database via Prisma.

---

## Technical Context

**Language/Version**: TypeScript 5.x across all services and packages. Node.js 20 LTS runtime.

**Primary Dependencies**:
- Frontend: Next.js 14+ (App Router), React 18+, tRPC client (`@trpc/client`, `@trpc/next`), CodeMirror 6, Radix UI, Tailwind v4, Auth.js v5
- API: Fastify 4, tRPC server (`@trpc/server` + Fastify adapter), Prisma 5, BullMQ 5 (producer), `@temporalio/client`, pino
- Sandbox service: Fastify 4, tRPC server (internal), BullMQ 5 (worker), Judge0 REST client, pino
- Capstone runner: `@temporalio/worker`, `@temporalio/activity`, `@kubernetes/client-node`, pino
- Design system: Radix UI primitives, Tailwind v4, Storybook 8
- Shared: Redis 7 (BullMQ backing + rate-limit store), PostgreSQL 16 (via Prisma)

**Storage**: PostgreSQL 16 (all relational data via Prisma), Redis 7 (BullMQ job queues + per-learner rate-limit token buckets)

**Testing**: Vitest across all Node.js services and packages; Playwright for frontend E2E; Prisma test environment (isolated test database per suite)

**Target Platform**: Linux server (Docker + Kubernetes), desktop/laptop browser (Chrome, Firefox, Safari)

**Project Type**: Full-stack TypeScript web application (pnpm monorepo)

**Performance Goals**:
- Code execution output visible within 5 seconds p95 (SC-004)
- Capstone step verification within 30 seconds p95 (SC-005)
- 100 concurrent learners with no latency degradation (SC-011)

**Constraints**:
- Desktop/laptop browser only — no mobile viewport support in v1
- Go track only in v1 — all other tracks `coming_soon`
- Dark theme only as the fully implemented theme in v1
- Sandbox resource limits: 10-second wall-clock ceiling, 256 MB memory cap per Judge0 execution
- Capstone DB sessions time out after 30 minutes of inactivity (enforced by Temporal workflow timer)

**Scale/Scope**: ~100 concurrent learners (private beta), ~10 Go track concepts + 6-step CRUD capstone

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Source Integrity | All dependency choices cite official docs | ✅ PASS | research.md documents official sources for every decision |
| II. Dependency Stewardship | No single-maintainer packages; stdlib preferred; all versions pinned | ✅ PASS | tRPC, BullMQ, Prisma, Temporal SDK — all multi-maintainer with active communities |
| III. Code Readability & Minimalism | No speculative code; minimum viable abstractions | ✅ PASS | Unified TypeScript stack eliminates cross-language complexity; tRPC removes hand-written API contracts |
| IV. TDD (NON-NEGOTIABLE) | Every source file has a corresponding test file at merge time | ✅ PASS | Vitest suites required per task; plan enforces Red→Green→Refactor |
| V. SOLID/YAGNI | No features beyond v1 spec | ✅ PASS | Multi-language support, billing, mobile — all deferred |
| VI. Documentation as First-Class | Docs ship in same PR as implementation | ✅ PASS | Storybook stories required per component (FR-048); ADRs required per major decision |
| VII. ADRs | Significant decisions captured at decision time | ✅ PASS | 8 ADRs in `docs/adr/` — see below |
| VIII. Code Cleanliness (NON-NEGOTIABLE) | Zero lint errors; no dead exports; no placeholder comments | ✅ PASS | ESLint + TypeScript strict mode required in CI across all packages |
| IX. Functional Purity | Domain logic pure; side effects at boundaries only | ✅ PASS | Submission scoring, state transitions, path computation — pure functions; BullMQ workers and Temporal activities are the explicit side-effect boundaries |

**ADRs** (`docs/adr/`):
- ADR-001: Monorepo tooling (pnpm + Turborepo)
- ADR-002: Sandbox execution engine (Judge0)
- ADR-003: Capstone DB provisioning (K8s Job + ephemeral Postgres sidecar)
- ADR-004: Code editor (CodeMirror 6)
- ADR-005: Exercise content storage (Git-embedded, CI-compiled to JSON)
- ADR-006: Backend runtime (Node.js/TypeScript across all services)
- ADR-007: API communication (tRPC)
- ADR-008: Async work split (BullMQ for short jobs, Temporal for long-running workflows)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-fluent-platform/
├── plan.md              # This file
├── research.md          # Phase 0: tech decisions
├── data-model.md        # Phase 1: DB schema + entity relationships
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   ├── api.md           # tRPC router contract (replaces REST endpoint list)
│   ├── content-schema.md # Exercise folder schema
│   └── sandbox-api.md   # Internal sandbox tRPC contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/
  web/                         # Next.js 14+ — learner UI
    src/
      app/                     # App Router pages + layouts
      components/              # Feature components (lesson, repl, path, capstone, dashboard)
      lib/
        trpc/                  # tRPC client setup + provider
        auth/                  # Auth.js client helpers
      hooks/                   # use-submission, use-capstone-session, use-path
    tests/
      unit/                    # Vitest + Testing Library
      e2e/                     # Playwright scenarios

  api/                         # Fastify + tRPC — main application API
    src/
      router/                  # tRPC routers (one file per resource: tracks, enrollments,
      │                        #   concepts, submissions, testout, placement, capstone,
      │                        #   dashboard, profile, credentials)
      service/                 # Business logic — pure functions, no I/O
      │  ├── concept-state.ts  # State transition rules
      │  ├── mastery.ts        # Mastery event + time-saved computation
      │  ├── streak.ts         # Streak update logic
      │  └── placement.ts      # Placement scoring
      db/                      # Prisma client export + query helpers
      queue/                   # BullMQ producers (code-execution, test-suite queues)
      temporal/                # Temporal client — start/signal capstone workflows
      middleware/              # Auth validation, rate-limit enforcement, request logging
    prisma/
      schema.prisma            # Single source of truth for DB schema
      migrations/              # Prisma migration history
    tests/
      integration/             # Vitest + real test database (Prisma migrate reset)
      unit/                    # Pure service function tests

  sandbox/                     # BullMQ worker — code execution service
    src/
      router/                  # tRPC server for internal API (called by apps/api)
      worker/                  # BullMQ worker: dequeues and executes jobs
      executor/                # Judge0 REST client (submit, poll, decode output)
      limiter/                 # Per-learner token bucket (Redis-backed)
      streamer/                # SSE output streaming (pushes chunks to waiting API clients)
    tests/
      integration/             # Vitest + real Judge0 instance
      unit/

  capstone-runner/             # Temporal worker — capstone session workflows
    src/
      workflows/
        capstone-session.ts    # Main workflow: provision → heartbeat → teardown
      activities/
        provisioner.ts         # K8s Job + Postgres sidecar creation/deletion
        verifier.ts            # HTTP test runner against learner's deployed server
        session.ts             # DB connection status, fixture seeding, step completion
    tests/
      integration/
      unit/

packages/
  ui/                          # @fluent/ui — Rosetta design system
    src/
      components/              # Button, Input, Badge, Dialog, Editor, ConceptNode, etc.
      tokens/                  # Design token definitions (primitives + semantic)
      themes/                  # dark (default) + light token swap
    .storybook/
    tests/                     # Vitest + Storybook interaction tests

content/
  tracks/
    go/
      config.json
      concepts/
        01-variables-and-types/
          .meta/config.json
          instructions.md
          stub.go
          exemplar.go
          variables_test.go
          testout_stub.go
          testout_test.go
        [... 9 more concepts ...]
  capstone/
    go-crud-api/
      config.json
      steps/
        01-project-setup/
          instructions.md
          stub/
          verify.sh
          fixtures.sql
        [... 5 more steps ...]

tools/
  content-linter/              # TypeScript CLI: validates exercise schema + runs exemplar tests
    src/
      validator.ts             # File structure + config.json validation
      runner.ts                # Shells out to `go test` for exemplar verification

docs/
  adr/                         # 8 ADRs (001–008)
```

**Structure Decision**: Monorepo with four deployable `apps/` (web, api, sandbox, capstone-runner) and one shared package (`packages/ui`). Each app maps to exactly one bounded concern with a distinct scaling and security profile. The unified TypeScript stack means tRPC can enforce types across all service boundaries without code generation.

---

## Complexity Tracking

> No constitution violations. The four `apps/` services are not collapsible without mixing concerns: the sandbox service is a security boundary (untrusted code execution), the capstone runner has a fundamentally different runtime model (Temporal worker vs HTTP server), and the API is the only external-facing service.
