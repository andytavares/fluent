# Research: Fluent Platform — v1

**Phase**: 0 | **Date**: 2026-06-19 | **Plan**: [plan.md](./plan.md)

All architecture decisions documented below with rationale and rejected alternatives.

---

## Decision 1 — Monorepo Tooling

**Decision**: pnpm workspaces + Turborepo

**Rationale**: pnpm's symlink-based node_modules avoids phantom dependency issues common in Yarn/npm workspaces. Turborepo adds incremental build caching and an explicit dependency task graph — `packages/ui` builds before `apps/web` without manual orchestration. The combination is Vercel's documented recommendation for Next.js monorepos and is battle-tested in production.

**Alternatives considered**:
- Nx: More powerful but significantly more configuration surface; overkill for a 4-app monorepo.
- Lerna: Largely superseded by Turborepo for build orchestration.
- Separate repos: Cross-repo coordination required for every `@fluent/ui` change; PR preview environments become complex.

**Official sources**: https://pnpm.io/workspaces, https://turbo.build/repo/docs

---

## Decision 2 — Backend Runtime

**Decision**: Node.js 20 LTS + TypeScript 5 across all services (API, sandbox, capstone runner)

**Rationale**: A unified TypeScript stack means tRPC can enforce end-to-end types across all service boundaries without code generation or separate schema files. Engineers work in one language across the entire codebase. Prisma, BullMQ, and the Temporal TypeScript SDK are all Node-native with first-class TypeScript support. Node.js 20 LTS is the current long-term support release.

**What this replaces**: An earlier draft of this plan used Go for `apps/api` and `apps/sandbox`. Go was ruled out because: (1) tRPC requires TypeScript on both sides of each call, and the design calls for tRPC throughout; (2) Prisma has no Go client; (3) the BullMQ + Temporal TypeScript SDKs are the canonical clients — there is no first-class Go SDK for BullMQ, and Temporal's Go SDK would add a second language to maintain.

The content linter (`tools/content-linter`) is TypeScript but shells out to `go build` / `go test` to validate Go exercise content — this is the only Go toolchain dependency.

**Official sources**: https://nodejs.org/en/about/previous-releases, https://www.typescriptlang.org/docs/

---

## Decision 3 — API Communication

**Decision**: tRPC across all service-to-service and frontend-to-API boundaries

**Rationale**: tRPC generates a fully typed client from the server router definition — no schema files, no code generation step, no client/server type drift. When the API adds a field, TypeScript errors appear immediately in the frontend. This directly enforces Principle III (Code Readability & Minimalism) by eliminating a class of runtime contract bugs at zero overhead.

Internal calls (`apps/api` → `apps/sandbox`) also use tRPC, giving the same type guarantees for internal service boundaries.

**What this replaces**: An earlier draft considered GraphQL for the public API. GraphQL adds a query language useful for external consumers (mobile apps, third-party integrations). Since v1 has exactly one consumer — the Next.js frontend — GraphQL's flexibility is unnecessary complexity. tRPC is the right tool when both sides of the call are TypeScript and you control both.

**gRPC** was also considered for internal service calls. gRPC requires protobuf compilation in the build pipeline and adds binary encoding complexity. For TypeScript-to-TypeScript calls, tRPC over HTTP achieves the same type safety at a fraction of the setup cost.

**Official sources**: https://trpc.io/docs

---

## Decision 4 — Async Work Split (BullMQ + Temporal)

**Decision**: BullMQ for short-lived async jobs; Temporal for long-running stateful workflows

These are complementary tools, not alternatives.

**BullMQ** (Redis-backed job queue) handles:
- Code execution jobs: learner hits Run → API enqueues `code-execution` job → sandbox BullMQ worker processes via Judge0 → result streamed back via SSE
- Test suite runs (same queue, different job type)
- Credential generation

BullMQ is the right fit here because these jobs are short-lived (seconds), stateless, and benefit from Redis-backed queue semantics (priority, concurrency limits, retries with backoff).

**Temporal** (durable workflow orchestration) handles:
- Capstone session lifecycle: `provision K8s Job + DB → wait for learner activity (signal) → inactivity timer (30 min) → teardown`. This is a long-running, stateful workflow with:
  - External signals (learner's step submission resets the inactivity timer)
  - Durable timers (Temporal's `sleep` survives worker restarts; a BullMQ delayed job would lose state on restart)
  - Multi-step activities (provision, verify, teardown) with guaranteed execution and rollback

**Why not BullMQ for capstone sessions?** A 30-minute inactivity timer implemented as a BullMQ delayed job would require: (1) cancelling and re-enqueuing on every learner action, (2) storing session state in Redis manually, (3) handling worker restarts with no durability guarantee. Temporal's workflow model handles all three natively.

**Official sources**: https://docs.bullmq.io/, https://docs.temporal.io/

---

## Decision 5 — Database ORM

**Decision**: Prisma 5 with PostgreSQL 16

**Rationale**: Prisma provides a type-safe query builder generated from `schema.prisma` — the generated client matches the exact shape of every table and relation. Migrations are managed via `prisma migrate` with a full history in `prisma/migrations/`. The Prisma schema serves as the single source of truth for the data model. Strong multi-maintainer community; owned by Prisma Data (backed company, not single maintainer).

**Alternatives considered**:
- Drizzle ORM: Newer, lighter, also type-safe, but smaller ecosystem and less mature migration tooling at time of decision.
- Knex.js: Query builder only, no type generation from schema — defeats the point of a TypeScript stack.
- Raw `pg`/`postgres.js`: Maximum performance but requires manual type management; disproportionate for this use case.

**Official sources**: https://www.prisma.io/docs

---

## Decision 6 — Sandbox Execution Engine

**Decision**: Judge0 CE (self-hosted)

**Rationale**: Judge0 wraps Linux `isolate` (cgroups + namespaces + seccomp) and exposes a REST API. Self-hosting gives full control over resource limits, Go version, and data residency. Execution limits (10-second wall clock, 256 MB memory) are configurable per submission to satisfy FR-012. CE edition is MIT-licensed with an active multi-maintainer community and production deployments at LeetCode, HackerEarth.

The sandbox service (`apps/sandbox`) is a BullMQ worker that dequeues execution jobs, calls Judge0, and streams output back via SSE.

**Alternatives considered**:
- Firecracker microVMs: Stronger isolation but requires KVM-capable hardware; disproportionate for 100-learner beta.
- Custom isolate wrapper: Re-implements queue management and language runtime management that Judge0 provides.
- Piston: Single primary maintainer — ruled out per Principle II.

**Official sources**: https://github.com/judge0/judge0

---

## Decision 7 — Capstone DB Provisioning

**Decision**: Kubernetes Jobs with an ephemeral PostgreSQL sidecar (one Pod per learner capstone session), lifecycle managed by a Temporal workflow

**Rationale**: K8s Job + Postgres sidecar in the same Pod means: (1) true per-learner DB isolation, (2) the learner's server and DB share a network namespace (localhost connectivity), (3) Pod termination is the guaranteed cleanup. The Temporal `CapstonSessionWorkflow` manages the full lifecycle — provision, heartbeat, inactivity timer, teardown — with durable state that survives worker restarts.

**Official sources**: https://kubernetes.io/docs/concepts/workloads/controllers/job/

---

## Decision 8 — Code Editor

**Decision**: CodeMirror 6

**Rationale**: TypeScript-first, composable, minimal bundle size. Extensions are pure values (aligns with Principle IX). Supports Go syntax highlighting via Lezer grammar. Active multi-maintainer community. Controlled value model integrates cleanly with React state for reset-to-stub (FR-016).

**Alternatives considered**:
- Monaco Editor: ~5 MB bundle, web worker setup required, disproportionate for a teaching REPL.
- Ace Editor: Older codebase, less active maintenance.

**Official sources**: https://codemirror.net/docs/

---

## Decision 9 — Exercise Content Storage

**Decision**: Git-embedded content in `content/`, compiled to static JSON at CI time, served from the API's filesystem

**Rationale**: PR-based authoring (FR-035), CI linter (FR-036, FR-037), preview environments as branch deploys (FR-039), and new tracks via new folders only (FR-040) all follow naturally from Git-embedded content. No runtime reads from GitHub API; no DB schema changes for new exercises. The TypeScript content linter shells out to `go build` and `go test` for Go-specific validation.

**Alternatives considered**:
- Runtime GitHub API reads: Latency per page load; third-party dependency in the hot path.
- Exercises in PostgreSQL: Requires a migration pipeline; loses the PR authoring workflow.

**Official sources**: https://docs.github.com/en/actions

---

## Decision 10 — Streaming Architecture

**Decision**: Server-Sent Events (SSE) for code execution output

**Rationale**: SSE is unidirectional (server → client), which exactly matches code execution output. Works over HTTP/2 with no upgrade ceremony. Natively supported by the browser's `EventSource` API. The BullMQ job processor in `apps/sandbox` polls Judge0 and emits SSE chunks; `apps/api` holds open the SSE connection to the browser.

**Official sources**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---

## Decision 11 — Authentication

**Decision**: Auth.js v5 (NextAuth) — email/password + GitHub OAuth

**Rationale**: Native Next.js App Router support. PostgreSQL adapter (`@auth/prisma-adapter`) integrates with the existing Prisma schema. GitHub OAuth is high-value for the target audience (engineers). Registration is open (clarification Q4), so no invite gate to implement.

**Official sources**: https://authjs.dev/

---

## Decision 12 — Observability

**Decision**: pino (structured logging) + Prometheus metrics + Grafana + Alertmanager

**Rationale**: pino is the fastest Node.js structured logger with JSON output compatible with Grafana Loki for log aggregation. Prometheus + Grafana is the CNCF-standard open-source observability stack for Kubernetes services, satisfying FR-049–053 (structured logs, p50/p95/p99 metrics, alerting).

**Official sources**: https://getpino.io/, https://prometheus.io/docs/

---

## Resolved Unknowns Summary

| Decision | Resolution |
|----------|-----------|
| Monorepo tooling | pnpm + Turborepo |
| Backend runtime | Node.js 20 + TypeScript 5 (all services) |
| API communication | tRPC throughout |
| Short-lived async jobs | BullMQ 5 (Redis-backed) |
| Long-running workflows | Temporal (capstone session lifecycle) |
| ORM | Prisma 5 |
| Sandbox execution | Judge0 CE (self-hosted) |
| Capstone DB provisioning | K8s Job + Postgres sidecar (Temporal-managed) |
| Code editor | CodeMirror 6 |
| Content storage | Git-embedded, CI-compiled to JSON |
| Streaming | SSE |
| Auth | Auth.js v5 (email + GitHub OAuth) |
| Observability | pino + Prometheus + Grafana + Alertmanager |
| Cache / queue backing | Redis 7 |
