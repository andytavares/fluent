# Fluent Platform

An interactive coding-education platform for engineers who already know how to program. v1 teaches Go by building a real CRUD API — with adaptive placement, an in-browser REPL, test-out challenges, and an ephemeral per-learner database for the capstone project.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Repository structure](#2-repository-structure)
3. [Prerequisites](#3-prerequisites)
4. [Local development setup](#4-local-development-setup)
5. [Running the stack](#5-running-the-stack)
6. [Environment variables](#6-environment-variables)
7. [Testing](#7-testing)
8. [Design system — Rosetta](#8-design-system--rosetta)
9. [Content authoring](#9-content-authoring)
   - [How concepts work](#how-concepts-work)
   - [Adding a concept to an existing track](#adding-a-concept-to-an-existing-track)
   - [Adding a new language track](#adding-a-new-language-track)
   - [Editing capstone steps](#editing-capstone-steps)
   - [The content linter](#the-content-linter)
   - [Linter error codes](#linter-error-codes)
   - [Publishing vs. wip content](#publishing-vs-wip-content)
10. [Database schema](#10-database-schema)
11. [API — tRPC routers](#11-api--trpc-routers)
12. [CI/CD](#12-cicd)
13. [Observability](#13-observability)
14. [ADR index](#14-adr-index)
15. [Contributing](#15-contributing)

---

## 1. Architecture overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (learner)                  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
              ┌─────────▼──────────┐
              │   apps/web         │  Next.js 14 App Router
              │   localhost:3000   │  tRPC client, Auth.js v5
              └─────────┬──────────┘
                        │ tRPC (HTTP batch)
              ┌─────────▼──────────┐
              │   apps/api         │  Fastify 4 + tRPC
              │   localhost:3001   │  Prisma 5 → PostgreSQL 16
              └──┬──────┬──────────┘
                 │      │ BullMQ jobs
                 │  ┌───▼────────────┐
                 │  │ apps/sandbox   │  Fastify 4 + BullMQ worker
                 │  │ localhost:3002 │  Judge0 REST client
                 │  └───────────────┘  SSE → browser
                 │
                 │ Temporal client
      ┌──────────▼─────────────┐
      │ apps/capstone-runner   │  Temporal worker
      │                        │  K8s Jobs (per-learner DB)
      └────────────────────────┘

Shared infrastructure:
  PostgreSQL 16  :5432   (all relational data via Prisma)
  Redis 7        :6379   (BullMQ queues + rate-limit buckets)
  Judge0 CE      :2358   (sandboxed code execution)
  Temporal       :7233   (durable capstone workflow)
  Temporal UI    :8080
```

### How a code run works

1. Learner clicks **Run** in the browser.
2. `apps/web` calls `submissions.createSubmission` over tRPC → `apps/api`.
3. `apps/api` writes a `submission` row, enqueues a BullMQ job to `apps/sandbox`, and returns a `streamToken`.
4. `apps/sandbox` worker picks up the job, sends code to Judge0, streams `stdout`/`stderr`/`result` events to a Redis Stream keyed by `streamToken`.
5. Browser opens an `EventSource` SSE connection; `apps/api` reads the Redis stream and forwards events.

### How a capstone session works

1. Learner clicks **Start building**; `apps/api` calls `startCapstoneWorkflow` on the Temporal client.
2. `apps/capstone-runner` (Temporal worker) runs the `capstonSessionWorkflow`:
   - Calls the `provision` activity → creates a Kubernetes Job with a Postgres sidecar.
   - AES-256-GCM encrypts the DB connection string and stores it in `capstone_sessions`.
   - Waits for `learner-active` signals (reset on every step interaction).
   - After 30 minutes of inactivity, calls the `teardown` activity.
3. `apps/web` polls `capstone.getSessionStatus` every 3 seconds until `db_status === "connected"`.

---

## 2. Repository structure

```
fluent/
├── apps/
│   ├── web/                  Next.js 14 — learner UI (:3000)
│   ├── api/                  Fastify + tRPC — main API (:3001)
│   ├── sandbox/              BullMQ worker — code execution (:3002)
│   └── capstone-runner/      Temporal worker — capstone sessions
├── packages/
│   └── ui/                   @fluent/ui — Rosetta design system
├── tools/
│   ├── content-linter/       CLI: validates exercise folders
│   └── content-manifest/     CLI: compiles content/ → manifest.json
├── content/
│   ├── tracks/go/            Go track concepts (10 concepts)
│   └── capstone/go-crud-api/ Go capstone (6 steps)
├── tests/
│   └── load/                 k6 load test scripts
├── infra/
│   ├── prometheus/           Prometheus config (30-day retention)
│   ├── loki/                 Loki config (30-day retention)
│   └── alertmanager/         Alert rules
├── .github/workflows/        CI workflows
├── docker-compose.yml        Local dev infrastructure
├── turbo.json                Turborepo pipeline
├── pnpm-workspace.yaml       pnpm workspaces
└── specs/001-fluent-platform/ Full design documents
```

---

## 3. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS+ | All services and tooling |
| pnpm | 9+ | Package manager (required — do not use npm or yarn) |
| Docker + Compose | 24+ | PostgreSQL, Redis, Judge0, Temporal |
| Go | 1.22+ | Content linter: runs `go build` and `go test` on exercises |
| kubectl | any | Capstone runner: provisions K8s Jobs |
| k6 | latest | Load testing (`tests/load/concurrent-runs.js`) |

> **pnpm is required.** This is a pnpm workspace. Running `npm install` will fail with peer-dep conflicts or silently produce a broken install. Always use `pnpm`.

---

## 4. Local development setup

```bash
# 1. Clone and enter the repo
git clone https://github.com/your-org/fluent.git
cd fluent

# 2. Install all workspace dependencies
pnpm install

# 3. Copy environment config
cp .env.example .env.local
# Edit .env.local — at minimum fill in:
#   AUTH_SECRET (generate: openssl rand -hex 32)
#   AUTH_GITHUB_ID / AUTH_GITHUB_SECRET (create a GitHub OAuth App)

# 4. Start infrastructure
docker compose up -d

# 5. Run database migrations
pnpm --filter @fluent/api db:migrate

# 6. Seed the content manifest (compiles content/ → static JSON)
pnpm --filter @fluent/content-manifest start

# 7. Build shared packages
pnpm build --filter @fluent/ui
```

---

## 5. Running the stack

### All services at once (recommended)

```bash
pnpm dev
```

Turborepo starts all services in parallel:

| Service | URL | Description |
|---------|-----|-------------|
| Web (Next.js) | http://localhost:3000 | Learner UI |
| API (Fastify) | http://localhost:3001 | tRPC endpoint at `/trpc` |
| Sandbox | http://localhost:3002 | Internal execution service |
| Temporal UI | http://localhost:8080 | Capstone workflow inspector |

### Individual services

```bash
pnpm --filter @fluent/web dev          # Next.js only
pnpm --filter @fluent/api dev          # API only (tsx watch)
pnpm --filter @fluent/sandbox dev      # Sandbox only
pnpm --filter @fluent/capstone-runner dev  # Temporal worker only
```

### Useful infra commands

```bash
# Check all container health
docker compose ps

# Tail all logs
docker compose logs -f

# Reset the database (wipes all data)
pnpm --filter @fluent/api exec prisma migrate reset

# Open Prisma Studio (DB GUI)
pnpm --filter @fluent/api exec prisma studio
```

---

## 6. Environment variables

Copy `.env.example` to `.env.local` and fill in the values. All services read from the same file at the repo root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `AUTH_SECRET` | Yes | — | Auth.js session signing secret (min 32 chars) |
| `AUTH_GITHUB_ID` | Yes | — | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | Yes | — | GitHub OAuth App client secret |
| `EMAIL_SERVER` | Yes | — | SMTP URL for magic-link email (use Ethereal locally) |
| `EMAIL_FROM` | Yes | — | Sender address for magic-link emails |
| `JUDGE0_URL` | Yes | `http://localhost:2358` | Judge0 CE base URL |
| `TEMPORAL_ADDRESS` | Yes | `localhost:7233` | Temporal server gRPC address |
| `TEMPORAL_NAMESPACE` | No | `default` | Temporal namespace |
| `CAPSTONE_ENCRYPTION_KEY` | Yes | — | 64-char hex key for AES-256-GCM DB connection encryption |
| `CAPSTONE_K8S_NAMESPACE` | No | `fluent-capstone` | K8s namespace for ephemeral jobs |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `PORT` | No | `3001` | `apps/api` listen port |
| `SANDBOX_PORT` | No | `3002` | `apps/sandbox` listen port |

**GitHub OAuth setup** (local dev):
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret

---

## 7. Testing

### Run all tests

```bash
pnpm test
```

### By package

```bash
pnpm --filter @fluent/api test          # API unit + integration
pnpm --filter @fluent/sandbox test      # Sandbox unit + integration
pnpm --filter @fluent/ui test           # Rosetta component tests
pnpm --filter content-linter test       # Linter unit + integration
```

### Watch mode

```bash
pnpm --filter @fluent/api test:watch
```

### Integration tests

Integration tests require a running database and are skipped by default. Enable with:

```bash
INTEGRATION=true pnpm --filter @fluent/api test
```

This runs all tests in `apps/api/tests/integration/` against the real database. The test suite calls `prisma migrate reset` before each suite to ensure a clean state — **do not run against your production database.**

### E2E tests (Playwright)

```bash
# Start the full stack first (pnpm dev), then:
pnpm --filter @fluent/web test:e2e

# Watch mode with browser UI
pnpm --filter @fluent/web test:e2e:ui
```

E2E tests live in `apps/web/tests/e2e/`. They require the full stack running on the default ports.

### Accessibility audit

```bash
# Runs as part of E2E suite (apps/web/tests/e2e/a11y.spec.ts)
# Or manually via axe CLI:
npx @axe-core/cli http://localhost:3000 http://localhost:3000/tracks/go --exit
```

### Load test

```bash
k6 run tests/load/concurrent-runs.js \
  --env BASE_URL=http://localhost:3001 \
  --env USER_TOKEN=your-session-token
```

Thresholds: p95 < 10 s, error rate < 5%.

### Storybook

```bash
pnpm --filter @fluent/ui storybook
# Opens at http://localhost:6006
```

---

## 8. Design system — Rosetta

Rosetta is the internal design system for Fluent, published as `@fluent/ui` within the monorepo. All UI in the platform must be built from Rosetta components. Feature code must not write bespoke CSS for visual values.

### Token architecture

```
packages/ui/src/tokens/
  primitives.ts    Raw values: color scales, spacing, radius, type sizes
  semantic.ts      Named roles: --color-surface-base, --color-text-primary, etc.

packages/ui/src/themes/
  dark.css         :root { CSS custom properties } — default theme
  light.css        [data-theme="light"] { ... } — token swap, no component changes
  motion.css       @media (prefers-reduced-motion) { ... }
```

### Key rules

- Always use semantic tokens (`var(--color-text-primary)`), never raw values.
- Every new component must ship with a Storybook story in the same PR.
- Dark theme is the default. Light theme is a CSS token swap — no component logic changes.
- All interactive components must pass WCAG AA (4.5:1 text contrast, 3:1 UI element contrast).
- Use Radix UI primitives for all interactive behaviour (dialogs, menus, radio groups, etc.).

### Available components

| Component | Story | Description |
|-----------|-------|-------------|
| `Button` | `Button.stories.tsx` | Primary / secondary / ghost, three sizes |
| `Badge` | `Badge.stories.tsx` | Concept state indicator |
| `ConfidenceSelector` | `ConfidenceSelector.stories.tsx` | Track onboarding radio group |
| `PlacementTask` | `PlacementTask.stories.tsx` | Placement challenge editor |
| `CodeEditor` | `CodeEditor.stories.tsx` | CodeMirror 6, Go syntax, Ctrl+Enter shortcut |
| `OutputPane` | `OutputPane.stories.tsx` | SSE stdout/stderr display |
| `TestOutModal` | `TestOutModal.stories.tsx` | Timed test-out challenge dialog |
| `ConceptNode` | `ConceptNode.stories.tsx` | All 5 learning states |
| `CapstoneStepList` | `CapstoneStepList.stories.tsx` | Step progress list |
| `DatabaseStatusPanel` | `DatabaseStatusPanel.stories.tsx` | Capstone DB connection status |
| `DashboardStats` | `DashboardStats.stories.tsx` | 4-metric headline grid |
| `ContinueBuildingCard` | `ContinueBuildingCard.stories.tsx` | Dashboard resume card |
| `MasteryTable` | `MasteryTable.stories.tsx` | Per-concept mastery breakdown |

---

## 9. Content authoring

All track content lives in `content/` and is version-controlled alongside the platform code. A CI linter validates every PR. No platform deployment is required to add or change content.

### How concepts work

Each concept has:
- **`instructions.md`** — learner-facing prose (prose + "vs your language" framing)
- **`stub.go`** — the starting code the learner receives
- **`exemplar.go`** — the reference solution (never served to learners, used by CI linter)
- **`{concept}_test.go`** — hidden test suite run on submission
- **`testout_stub.go`** / **`testout_test.go`** — harder challenge for the test-out flow (required if `has_testout: true`)

The concept moves through these learner states:

```
locked → available → in_progress → completed   (lesson path)
                   → mastered                  (test-out or placement)
```

### Adding a concept to an existing track

**Step 1** — Create the folder structure:

```
content/tracks/go/concepts/
  NNN-your-concept-slug/        # NNN = zero-padded position, e.g., 011
    config.json
    instructions.md
    stub.go
    exemplar.go
    your_concept_test.go
    testout_stub.go             # only if has_testout: true
    testout_test.go             # only if has_testout: true
```

**Step 2** — Write `config.json`:

```json
{
  "slug": "your-concept-slug",
  "title": "Your Concept Title",
  "description": "One-liner shown on the learning path",
  "blurb": "vs your language: how this differs from what you know",
  "status": "wip",
  "has_testout": true,
  "difficulty": "medium"
}
```

Field rules:
- `slug` must match the directory name (without the `NNN-` prefix)
- `status`: `"wip"` (hidden from learners, safe to merge) or `"active"` (live)
- `difficulty`: `"introductory"` | `"easy"` | `"medium"` | `"hard"`
- `blurb` is required when `status` is `"active"` (linter error E008 if missing)

**Step 3** — Write `instructions.md` using the required structure:

```markdown
# Your Concept Title

## What you'll learn

[One paragraph: what this concept teaches in Go]

## vs your language

[Comparison: how this differs from Python/JS/Java/etc.]

## The task

[What the learner must implement, referencing stub.go]

## Example

[Optional: a small illustrative snippet]
```

**Step 4** — Write `stub.go` (must compile but not solve the task):

```go
package main

// Solve returns the sum of two integers.
// Replace this with your implementation.
func Solve(a, b int) int {
	panic("not implemented")
}
```

**Step 5** — Write `exemplar.go` (must pass the test suite):

```go
package main

func Solve(a, b int) int {
	return a + b
}
```

**Step 6** — Write `your_concept_test.go` (minimum 2 test cases):

```go
package main

import "testing"

func TestSolveAddsPositives(t *testing.T) {
	got := Solve(2, 3)
	if got != 5 {
		t.Errorf("Solve(2, 3) = %d, want 5", got)
	}
}

func TestSolveAddsNegatives(t *testing.T) {
	got := Solve(-1, -2)
	if got != -3 {
		t.Errorf("Solve(-1, -2) = %d, want -3", got)
	}
}
```

**Step 7** — Register the concept in the track config:

```json
// content/tracks/go/config.json
{
  "concepts": [
    "01-variables-and-types",
    ...
    "011-your-concept-slug"   ← add at the correct position
  ]
}
```

**Step 8** — Run the linter locally:

```bash
node tools/content-linter/dist/cli.js \
  content/tracks/go/concepts/011-your-concept-slug
# Exit 0 = pass. Exit 1 = errors to fix before PR.
```

**Step 9** — Open a PR. CI will lint automatically. The preview workflow posts a URL to the PR where the concept can be seen exactly as a learner would.

**Step 10** — When ready to go live, change `"status": "wip"` to `"status": "active"` in `config.json` and open a second PR (or include it in the same PR).

---

### Adding a new language track

Adding a new track requires **no platform code changes** (FR-040). It is a content-only change.

**Step 1** — Create the track directory:

```
content/tracks/
  rust/                     ← new track slug
    config.json
    concepts/
      01-ownership/
        config.json
        instructions.md
        stub.rs             ← use the correct file extension
        exemplar.rs
        ownership_test.rs
```

**Step 2** — Write the track `config.json`:

```json
{
  "slug": "rust",
  "title": "Rust",
  "description": "Build a production web service in Rust.",
  "language": "rust",
  "status": "coming_soon",
  "version": "0.1.0",
  "concepts": [
    "01-ownership",
    "02-borrowing"
  ]
}
```

Set `"status": "coming_soon"` until the track is ready for learners. The platform will show the track in the UI with a "coming soon" label and no navigation.

**Step 3** — Register a Judge0 language ID for the new language.

Each language in exercises must map to a Judge0 language ID. Find the ID at your Judge0 instance:

```bash
curl http://localhost:2358/languages | jq '.[] | select(.name | test("Rust"))'
# e.g., {"id": 73, "name": "Rust (1.40.0)"}
```

Add the mapping to `apps/api/src/router/submissions.ts` in the `LANGUAGE_ID_MAP`:

```typescript
const LANGUAGE_ID_MAP: Record<string, number> = {
  go: 95,
  rust: 73,   // ← add new language
};
```

**Step 4** — (Optional) Add syntax highlighting to CodeEditor.

`packages/ui/src/components/CodeEditor.tsx` dynamically imports CodeMirror language packages. Add a new branch for the language:

```typescript
// packages/ui/src/components/CodeEditor.tsx
if (language === "rust") {
  const { rust } = await import("@codemirror/lang-rust");
  extensions.push(rust());
}
```

Install the package:

```bash
pnpm --filter @fluent/ui add @codemirror/lang-rust
```

**Step 5** — Open a PR. The CI linter will validate all concept folders in the new track. Set concepts to `"status": "wip"` until they are polished enough for learners. Graduate to `"active"` one by one.

**Step 6** — When ready to go live, change the track `status` from `"coming_soon"` to `"active"`.

---

### Editing capstone steps

Capstone steps live in `content/capstone/{track-slug}-{capstone-name}/`:

```
content/capstone/go-crud-api/
  config.json        # step definitions + metadata
  step-1/
    instructions.md  # learner-facing task description
    verify.sh        # HTTP verification script
    fixtures.sql     # DB seed for this step
  step-2/
    ...
```

**To edit a step description**, update `step-N/instructions.md`. No code change needed.

**To edit step verification logic**, update `step-N/verify.sh`. The script must:
- Make HTTP requests against `localhost:8080` (the learner's running app)
- Print one JSON object per test to stdout: `{"method","path","expected_status","actual_status","passed","body"}`
- Exit 0 if all tests pass, 1 if any fail
- Complete within 30 seconds

```bash
#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8080"

response=$(curl -s -o /tmp/body.txt -w "%{http_code}" \
  -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","price":9.99}')
passed=$( [ "$response" -eq 201 ] && echo true || echo false )
echo "{\"method\":\"POST\",\"path\":\"/items\",\"expected_status\":201,\"actual_status\":$response,\"passed\":$passed,\"body\":$(cat /tmp/body.txt | jq -c .)}"
[ "$passed" = "true" ] || exit 1
```

**To add a new capstone step**, add the step directory and update `config.json`:

```json
{
  "steps": [
    ...
    {
      "number": 7,
      "slug": "pagination",
      "title": "Add Pagination",
      "description": "Add limit/offset pagination to GET /items.",
      "verification_type": "http",
      "prerequisite_concepts": ["http-and-routing"]
    }
  ],
  "total_steps": 7
}
```

---

### The content linter

The content linter is a TypeScript CLI in `tools/content-linter/`. It runs automatically in CI on every PR that touches `content/`.

**Build and run locally:**

```bash
# Build the linter
pnpm --filter content-linter build

# Lint a single concept folder
node tools/content-linter/dist/cli.js content/tracks/go/concepts/01-concept-1

# Lint all concepts in a track
for dir in content/tracks/go/concepts/*/; do
  node tools/content-linter/dist/cli.js "$dir"
done
```

The linter runs two passes:
1. **Static validation** — checks file structure, parses `config.json`, validates required fields.
2. **Runtime checks** — runs `go build` on `stub.go` and `go test ./...` with `exemplar.go` to verify the reference solution passes its own tests.

### Linter error codes

| Code | Severity | Description |
|------|----------|-------------|
| `E001` | Error | Missing required file (`instructions.md`, `stub.go`, `exemplar.go`, `{concept}_test.go`) |
| `E002` | Error | `config.json` parse error or missing required field |
| `E003` | Error | `stub.go` does not compile (`go build` failed) |
| `E004` | Error | Exemplar does not pass its own test suite (`go test` failed) |
| `E005` | Error | `has_testout: true` but `testout_stub.go` or `testout_test.go` missing |
| `E006` | Error | Test file has fewer than 2 test cases |
| `E007` | Error | `config.json` references a concept directory that does not exist |
| `E008` | Error | `status: active` concept is missing `blurb` field |
| `W001` | Warning | `status: wip` — content is incomplete (warning only, does not block merge) |

All `E` codes block merge. `W` codes are informational.

### Publishing vs. wip content

Set `"status"` in the concept `config.json`:

| Status | Visible to learners | Blocks merge on lint failure | Use when |
|--------|--------------------|-----------------------------|----------|
| `"wip"` | No | No (W001 warning only) | Drafting, incomplete content |
| `"active"` | Yes | Yes | Content is polished and ready |

To graduate a concept from `wip` to `active`:
1. Ensure all linter errors pass (E001–E008).
2. Add the `"blurb"` field to `config.json`.
3. Change `"status": "wip"` to `"status": "active"`.
4. Open a PR — CI will lint and block if anything is missing.

---

## 10. Database schema

All tables are managed by Prisma. Schema lives in `apps/api/prisma/schema.prisma`.

| Table | Description |
|-------|-------------|
| `users` | Learner accounts — identity, streak, join date |
| `tracks` | Language curricula — slug, title, version, status |
| `concepts` | Ordered teachable units within a track |
| `exercises` | Lesson artifacts (1:1 with concept) — content_ref to manifest |
| `enrollments` | Learner ↔ track participation |
| `concept_states` | Per-learner concept progress (`locked` → `available` → `in_progress` → `mastered`/`completed`) |
| `submissions` | Immutable code run records — stdout, stderr, exit code, pass/fail |
| `mastery_events` | One per mastery achievement — drives the "time saved" metric |
| `capstone_sessions` | Active capstone session — K8s job name, encrypted DB connection |
| `capstone_step_completions` | Persisted completed steps — survives session restart |
| `credentials` | Shareable track completion tokens |

### Key state machine — `concept_states.state`

```
locked       → available      prerequisite concept mastered or completed
available    → in_progress    learner opens the lesson
available    → mastered       placement: learner passes placement task
in_progress  → mastered       test_out: learner passes test-out challenge
in_progress  → completed      lesson: learner passes lesson test suite
```

### Migrations

```bash
# Create a new migration after editing schema.prisma
pnpm --filter @fluent/api db:migrate

# Apply migrations in production (no interactive prompts)
pnpm --filter @fluent/api db:migrate:deploy

# Regenerate the Prisma client after schema changes
pnpm --filter @fluent/api db:generate
```

---

## 11. API — tRPC routers

All client–server communication goes through tRPC at `apps/api/src/router/`. The routers are:

| Router | Procedures | Description |
|--------|-----------|-------------|
| `tracks` | `listTracks`, `getTrack`, `listConcepts`, `getConceptLesson` | Track and concept data |
| `enrollments` | `createEnrollment`, `getEnrollment`, `listEnrollments` | Track enrollment management |
| `placement` | `startPlacement`, `submitTask`, `skipPlacement` | Adaptive placement flow |
| `concepts` | `listConceptStates` | Per-learner concept state list |
| `submissions` | `createSubmission`, `getSubmission`, `completeSubmission` | Code run + test suite |
| `testout` | `startChallenge`, `submitChallenge` | Test-out timed challenge |
| `capstone` | `getCapstone`, `createSession`, `getSessionStatus`, `verifyStep` | Capstone builder |
| `dashboard` | `getDashboard` | Aggregated learner stats |
| `profile` | `getProfile`, `getMastery`, `generateCredential`, `getCredential` | Profile and credentials |

All procedures except `listTracks` and `getTrack` require authentication. Unauthenticated requests get `UNAUTHORIZED`.

The sandbox service (`apps/sandbox`) exposes its own internal tRPC router at `:3002` — it is not exposed to the browser and is only called by `apps/api`.

---

## 12. CI/CD

### GitHub Actions workflows

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| Content lint | `.github/workflows/content-lint.yml` | PR touching `content/` | Lints all changed exercise folders; blocks merge on E errors |
| Content preview | `.github/workflows/content-preview.yml` | PR touching `content/` | Builds manifest, deploys preview env, posts URL as PR comment |

### Local CI checks (run before pushing)

```bash
pnpm lint         # ESLint across all packages
pnpm typecheck    # TypeScript strict across all packages
pnpm test         # Vitest across all packages
pnpm format:check # Prettier format check
```

All four must pass before a PR is mergeable (enforced in CI). The constitution (Principle VIII) requires zero lint errors.

---

## 13. Observability

### Metrics

Prometheus scrapes two endpoints:

| Service | Endpoint | Metrics |
|---------|----------|---------|
| `apps/api` | `:3001/metrics` | `http_request_duration_seconds`, `http_requests_total`, `submission_errors_total` |
| `apps/sandbox` | `:3002/metrics` | `execution_duration_seconds`, `executions_total`, `active_workers` |

Config: `infra/prometheus/config.yml` — 30-day retention.

### Logs

All services emit structured JSON logs via pino. Key log events:

- **Code execution** (`apps/sandbox`): `event`, `jobId`, `userId`, `conceptId`, `duration_ms`, `exit_code`
- **Capstone activity** (`apps/capstone-runner`): `event`, `sessionId`, `step`, `duration_ms`

Log ingestion: Loki at `infra/loki/config.yml` — 30-day retention.

### Alerts

`infra/alertmanager/rules.yml` fires alerts when:

| Alert | Threshold | Window |
|-------|-----------|--------|
| `SandboxP95Latency` | p95 execution time > 10 s | 5 min |
| `SandboxErrorRateHigh` | Error rate > 5% | 5 min |
| `CapstoneProvisionFailureHigh` | Provision failure rate > 1% | 10 min |
| `APIHighErrorRate` | 5xx rate > 5% | 5 min |

### Health checks

```bash
# API liveness
curl http://localhost:3001/healthz     # 200 OK

# API readiness (checks DB connectivity)
curl http://localhost:3001/readyz      # 200 OK when DB is reachable

# Sandbox liveness
curl http://localhost:3002/healthz
```

---

## 14. ADR index

Architecture Decision Records live in `docs/adr/`:

| ADR | Decision |
|-----|----------|
| ADR-001 | Monorepo tooling: pnpm + Turborepo |
| ADR-002 | Sandbox execution engine: Judge0 CE (self-hosted) |
| ADR-003 | Capstone DB provisioning: K8s Job + ephemeral Postgres sidecar |
| ADR-004 | Code editor: CodeMirror 6 |
| ADR-005 | Exercise content storage: Git-embedded, CI-compiled to JSON |
| ADR-006 | Backend runtime: Node.js/TypeScript across all services |
| ADR-007 | API communication: tRPC (replaces REST + code-gen) |
| ADR-008 | Async work split: BullMQ (short jobs) + Temporal (long-running workflows) |

---

## 15. Contributing

### Branch naming

```
{issue-number}-{short-description}
# e.g., 42-goroutines-concept
```

### Before opening a PR

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm format:check
```

All four must be green. The CI pipeline blocks merge on any failure.

### Commit style

Follow conventional commits:

```
feat: add goroutines concept to Go track
fix: correct concept state transition for test-out timeout
docs: update content authoring guide
test: add integration test for capstone step resume
```

### Constitution

The project operates under a 9-principle constitution at `specs/001-fluent-platform/.specify/memory/constitution.md`. The two non-negotiable principles are:

- **Principle IV — TDD**: Every source file must have a corresponding test file. Write tests first (Red → Green → Refactor).
- **Principle VIII — Code Cleanliness**: Zero ESLint errors. No dead exports. No placeholder comments. TypeScript strict mode, no `any`.

### Design system rule

No feature-level code may add raw CSS for visual values. All styles must reference Rosetta tokens from `@fluent/ui`. New components must ship with a Storybook story in the same PR.
