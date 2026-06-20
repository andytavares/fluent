# Tasks: Fluent Platform — v1

**Input**: Design documents from `specs/001-fluent-platform/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per constitution Principle IV (TDD is NON-NEGOTIABLE) — test tasks are included for every user story. Write tests first, confirm they fail, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US8)

---

## Phase 1: Setup

**Purpose**: Monorepo scaffolding, tooling, and local dev infrastructure. No application logic here.

- [X] T001 Initialize pnpm workspace root with turbo.json pipeline (build → test → lint dependency graph) in package.json and turbo.json
- [X] T002 [P] Scaffold apps/web with Next.js 14 App Router, TypeScript 5 strict, Tailwind v4, and alias for @fluent/ui in apps/web/package.json and apps/web/tsconfig.json
- [X] T003 [P] Scaffold apps/api with Fastify 4, TypeScript 5 strict, tRPC server adapter, and Prisma 5 CLI in apps/api/package.json and apps/api/tsconfig.json
- [X] T004 [P] Scaffold apps/sandbox with Fastify 4, TypeScript 5 strict, BullMQ 5, and tRPC server adapter in apps/sandbox/package.json and apps/sandbox/tsconfig.json
- [X] T005 [P] Scaffold apps/capstone-runner with TypeScript 5 strict, @temporalio/worker, @temporalio/activity, and @kubernetes/client-node in apps/capstone-runner/package.json and apps/capstone-runner/tsconfig.json
- [X] T006 [P] Scaffold packages/ui (@fluent/ui) with Radix UI, Tailwind v4, Storybook 8, and Vitest in packages/ui/package.json and packages/ui/tsconfig.json
- [X] T007 [P] Configure ESLint (typescript-eslint strict) and Prettier across all packages via root eslint.config.ts and .prettierrc
- [X] T008 [P] Configure Vitest workspace (shared config for apps/api, apps/sandbox, apps/capstone-runner, packages/ui) in vitest.workspace.ts
- [X] T009 [P] Scaffold tools/content-linter TypeScript CLI (tsconfig, esbuild build script, bin entry) in tools/content-linter/package.json
- [X] T010 [P] Create Docker Compose file for local dev (PostgreSQL 16, Redis 7, Judge0 CE, Temporal server) in docker-compose.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T011 Write Prisma schema for all 11 tables (users, tracks, concepts, exercises, enrollments, concept_states, submissions, mastery_events, capstone_sessions, capstone_step_completions, credentials) per data-model.md in apps/api/prisma/schema.prisma
- [X] T012 Generate and run initial Prisma migration (all tables + indexes from data-model.md) in apps/api/prisma/migrations/0001_initial/
- [X] T013 [P] Implement Prisma client singleton and db query helpers in apps/api/src/db/client.ts and apps/api/src/db/index.ts
- [X] T014 [P] Implement tRPC base router, context factory (auth session + db), and Fastify server entrypoint in apps/api/src/router/index.ts and apps/api/src/index.ts
- [X] T015 [P] Configure Auth.js v5 with Prisma adapter, GitHub OAuth provider, and email provider in apps/api/src/middleware/auth.ts and apps/web/src/lib/auth/config.ts
- [X] T016 [P] Implement tRPC client provider and createTRPCNext setup in apps/web/src/lib/trpc/client.ts and apps/web/src/lib/trpc/provider.tsx
- [X] T017 [P] Initialize Temporal worker with connection config and activity/workflow registration scaffold in apps/capstone-runner/src/worker.ts and apps/capstone-runner/src/index.ts
- [X] T018 [P] Implement pino request logging middleware for apps/api and apps/sandbox (structured JSON, request ID propagation) in apps/api/src/middleware/logger.ts and apps/sandbox/src/middleware/logger.ts
- [X] T019 [P] Implement Prometheus metrics middleware (request duration histogram, active connections gauge) and /metrics endpoint in apps/api/src/middleware/metrics.ts and apps/api/src/router/internal.ts
- [X] T020 [P] Implement Redis connection singleton (ioredis) shared by BullMQ and rate limiter in apps/api/src/db/redis.ts and apps/sandbox/src/db/redis.ts
- [X] T021 [P] Define BullMQ queue names, job type schemas, and shared queue config (retry policy, concurrency) in apps/api/src/queue/queues.ts and apps/sandbox/src/worker/queues.ts
- [X] T022 [P] Bootstrap Rosetta design tokens — primitive values (color scale, spacing, radius, type) and semantic layer (surface, text, border, status tokens) in packages/ui/src/tokens/primitives.ts and packages/ui/src/tokens/semantic.ts
- [X] T023 [P] Implement dark theme as default (@theme CSS variables from semantic tokens) in packages/ui/src/themes/dark.css and packages/ui/src/themes/index.ts
- [X] T129 [P] Implement /healthz (liveness) and /readyz (readiness + DB ping) endpoints in apps/api/src/router/internal.ts and apps/sandbox/src/router/internal.ts (FR-016a, SC-012)
- [X] T130 [P] Implement sign-in page (email + GitHub OAuth) using Auth.js v5 in apps/web/src/app/auth/sign-in/page.tsx
- [X] T131 [P] Implement sign-up page (email registration form, validation) in apps/web/src/app/auth/sign-up/page.tsx
- [X] T132 [P] Implement content manifest build script (compile content/tracks/ exercise folders to static JSON at CI time) in tools/content-manifest/src/build.ts and tools/content-manifest/package.json
- [X] T133 [P] Implement landing/marketing page (hero, CTA → sign-up, track preview) in apps/web/src/app/page.tsx

**Checkpoint**: Foundation ready — all user story phases can now begin in parallel.

---

## Phase 3: User Story 1 — Onboarding & Adaptive Placement (Priority: P1) 🎯 MVP

**Goal**: A new learner can select a starting confidence level, take an optional placement challenge, and have concepts they pass pre-marked mastered before opening any lesson.

**Independent Test**: Register a new account, enroll in the Go track, submit a correct placement solution for concept 1, then GET /enrollments/:id/concepts and verify concept 1 is `mastered` with `achieved_via: placement` and concept 2 is `available`.

### Tests for User Story 1 *(TDD: write first, must fail before implementation)*

- [X] T024 [P] [US1] Unit tests for concept-state transition rules (all valid and invalid transitions) in apps/api/tests/unit/concept-state.test.ts
- [X] T025 [P] [US1] Unit tests for placement scoring service (pass → mastered, fail → available, skip → no-op; assert placement task count is between 5 and 8) in apps/api/tests/unit/placement.test.ts
- [X] T026 [P] [US1] Integration test: POST /enrollment → POST /placement/start → submit passing code → GET concepts shows correct mastered state in apps/api/tests/integration/placement.test.ts
- [X] T027 [P] [US1] Integration test: DELETE /placement/:id skips placement with no concepts pre-marked in apps/api/tests/integration/placement-skip.test.ts
- [X] T028 [P] [US1] E2E test: onboarding page renders confidence selector, placement challenge loads, passing submission collapses concept node in apps/web/tests/e2e/onboarding.spec.ts
- [X] T134 [P] [US1] Integration test: capstone session restart — close browser mid-session, call createSession again, verify current_step resumes at last completed step and completed steps are preserved in apps/api/tests/integration/capstone-restart.test.ts

### Implementation for User Story 1

- [X] T029 [P] [US1] Implement concept-state service (pure transition function, unlock-next logic) in apps/api/src/service/concept-state.ts
- [X] T030 [P] [US1] Implement placement service (score task, apply mastered transitions, skip handler) in apps/api/src/service/placement.ts
- [X] T031 [US1] Implement enrollments tRPC router (createEnrollment — creates enrollment + initializes all concept_states) in apps/api/src/router/enrollments.ts
- [X] T032 [US1] Implement placement tRPC router (startPlacement, submitTask, skipPlacement) in apps/api/src/router/placement.ts
- [X] T033 [US1] Implement tracks tRPC router (listTracks, getTrack, listConcepts — filter concepts with status=wip from public responses (FR-038), getConceptLesson) in apps/api/src/router/tracks.ts
- [X] T034 [P] [US1] Storybook story for ConfidenceSelector component (3 options, selection state) in packages/ui/src/components/ConfidenceSelector.stories.tsx
- [X] T035 [P] [US1] Implement ConfidenceSelector component (radio group, 3 confidence levels) in packages/ui/src/components/ConfidenceSelector.tsx
- [X] T036 [P] [US1] Storybook story for PlacementTask component (stub editor + submit + skip controls) in packages/ui/src/components/PlacementTask.stories.tsx
- [X] T037 [P] [US1] Implement PlacementTask component (inline editor, submit button, skip link) in packages/ui/src/components/PlacementTask.tsx
- [X] T038 [US1] Implement onboarding page (confidence selector → optional placement challenge flow) in apps/web/src/app/tracks/[trackSlug]/onboarding/page.tsx

**Checkpoint**: A new user can enroll in the Go track and complete or skip placement. Concept states reflect mastery correctly.

---

## Phase 4: User Story 2 — Lesson + REPL (Priority: P1)

**Goal**: A learner opens a concept lesson, edits code in a browser editor, runs it in a sandbox, sees streamed output, submits to run the hidden test suite, and advances the concept to `completed` on passing.

**Independent Test**: Open the lesson for an `available` concept, click Run with a valid Go snippet, verify stdout streams back within 5 seconds, click "Submit & check tests" with the exemplar code, verify concept advances to `completed` and the next concept unlocks to `available`.

### Tests for User Story 2 *(TDD: write first, must fail before implementation)*

- [X] T039 [P] [US2] Unit tests for streak service (consecutive days, miss = reset, same-day = no-op) in apps/api/tests/unit/streak.test.ts
- [X] T040 [P] [US2] Unit tests for mastery service (mastery event creation, time-saved computation from lesson_avg_time_ms) in apps/api/tests/unit/mastery.test.ts
- [X] T041 [P] [US2] Integration test for full execution job lifecycle (enqueue → BullMQ worker → Judge0 → SSE result) in apps/sandbox/tests/integration/execution.test.ts
- [X] T042 [P] [US2] Integration test: POST /submissions → stream shows stdout within 5s → concept advances to completed in apps/api/tests/integration/submission.test.ts
- [X] T043 [P] [US2] Integration test: 11th rapid submission in 60s returns 429 with retry_after_seconds in apps/api/tests/integration/rate-limit.test.ts
- [X] T044 [P] [US2] E2E test: lesson page loads prose + stub editor, run streams output, submit advances concept node in apps/web/tests/e2e/lesson-repl.spec.ts

### Implementation for User Story 2

- [X] T045 [P] [US2] Implement Judge0 REST client (submit, poll, decode base64 stdout/stderr) in apps/sandbox/src/executor/judge0-client.ts
- [X] T046 [P] [US2] Implement Redis-backed per-learner token-bucket rate limiter (10 runs/60s) in apps/sandbox/src/limiter/token-bucket.ts
- [X] T047 [P] [US2] Implement BullMQ code-execution worker (dequeue, call Judge0 client, write result to Redis stream; emit structured pino log per job with user_id, concept_id, duration_ms, exit_code — FR-049) in apps/sandbox/src/worker/execution-worker.ts
- [X] T048 [P] [US2] Implement SSE streamer (reads Redis stream, emits stdout/stderr/result events to waiting HTTP client) in apps/sandbox/src/streamer/sse-streamer.ts
- [X] T049 [P] [US2] Implement sandbox tRPC router (execute endpoint: rate-check → enqueue → return stream URL) in apps/sandbox/src/router/index.ts
- [X] T050 [US2] Implement BullMQ producer for code-execution queue in apps/api/src/queue/execution-queue.ts
- [X] T051 [US2] Implement submissions tRPC router (createSubmission, streamSubmission, runTestSuite) in apps/api/src/router/submissions.ts
- [X] T052 [US2] Implement streak service (update after successful submission) in apps/api/src/service/streak.ts
- [X] T053 [US2] Implement mastery service (create mastery_event, compute time-saved snapshot) in apps/api/src/service/mastery.ts
- [X] T054 [P] [US2] Storybook story for CodeEditor component (Go syntax, dark theme, reset control, all interactive states) in packages/ui/src/components/CodeEditor.stories.tsx
- [X] T055 [P] [US2] Implement CodeEditor component (CodeMirror 6, Go Lezer grammar, controlled value, reset-to-stub, run shortcut Ctrl+Enter) in packages/ui/src/components/CodeEditor.tsx
- [X] T056 [P] [US2] Storybook story for OutputPane component (idle, streaming, complete, timeout, error states) in packages/ui/src/components/OutputPane.stories.tsx
- [X] T057 [P] [US2] Implement OutputPane component (SSE EventSource consumer, stdout/stderr display, runtime/exit code) in packages/ui/src/components/OutputPane.tsx
- [X] T058 [US2] Implement useSubmission hook (create submission, open SSE stream, track state) in apps/web/src/hooks/use-submission.ts
- [X] T059 [US2] Implement lesson page (prose pane + CodeEditor + OutputPane + run/submit/reset controls + test-out trigger) in apps/web/src/app/tracks/[trackSlug]/concepts/[conceptSlug]/page.tsx

**Checkpoint**: A learner can open any available concept lesson, run code, see streamed output, submit to run tests, and advance the concept.

---

## Phase 5: User Story 3 — Test-Out (Priority: P1)

**Goal**: A learner clicks "I already know this — test out," gets a timed challenge with no hints, submits code, and either achieves `mastered` (pass) or drops gracefully into the guided lesson (fail or timeout) with no penalty.

**Independent Test**: Start a test-out challenge for an `available` concept, submit passing code before the 4-minute timer expires, verify concept transitions to `mastered` with `achieved_via: test_out`. Then start a second challenge on another concept, let it timeout, verify concept opens as `in_progress` with no penalty copy.

### Tests for User Story 3 *(TDD: write first, must fail before implementation)*

- [X] T060 [P] [US3] Unit tests for test-out service (pass → mastered, fail → in_progress, timer expired → in_progress) in apps/api/tests/unit/testout.test.ts
- [X] T061 [P] [US3] Integration test: POST /testout/start → submit passing code → concept.state === mastered in apps/api/tests/integration/testout-pass.test.ts
- [X] T062 [P] [US3] Integration test: POST /testout/start → submit failing code → concept.state === in_progress, no penalty fields in apps/api/tests/integration/testout-fail.test.ts
- [X] T063 [P] [US3] E2E test: click test-out trigger → modal opens with 4-min timer → submit → verify state transition, no penalty copy rendered in apps/web/tests/e2e/testout.spec.ts

### Implementation for User Story 3

- [X] T064 [P] [US3] Implement test-out service (server-side timer tracking, pass/fail transitions, timer-expiry handling) in apps/api/src/service/testout.ts
- [X] T065 [US3] Implement test-out tRPC router (startChallenge, submitChallenge — delegates execution to submissions queue) in apps/api/src/router/testout.ts
- [X] T066 [P] [US3] Storybook story for TestOutModal (timer states, challenge editor, escape hatch, pass/fail outcomes) in packages/ui/src/components/TestOutModal.stories.tsx
- [X] T067 [US3] Implement TestOutModal component (countdown timer, CodeEditor for challenge stub, "I'd rather do the lesson" escape) in packages/ui/src/components/TestOutModal.tsx
- [X] T068 [US3] Wire test-out modal into lesson page (trigger button always visible, modal opens without clearing editor state) in apps/web/src/app/tracks/[trackSlug]/concepts/[conceptSlug]/page.tsx (depends on T059)

**Checkpoint**: The full P1 learning loop is complete. A learner can place, lesson, run code, submit, and test out of any concept.

---

## Phase 6: User Story 4 — Learning Path (Priority: P2)

**Goal**: A learner sees their full personalized track as an ordered node list — each concept showing its state — and can navigate directly to any available concept. Mastered concepts are collapsed but re-openable.

**Independent Test**: After completing P1 flows (some concepts mastered, some completed, some locked), navigate to the track path page and verify every concept node renders with the correct state badge, clicking an `available` node navigates to its lesson, and clicking a `locked` node does nothing.

### Tests for User Story 4 *(TDD: write first, must fail before implementation)*

- [X] T069 [P] [US4] Integration test: GET /enrollments/:id/concepts returns all concepts with correct states after P1 flows in apps/api/tests/integration/learning-path.test.ts
- [X] T070 [P] [US4] E2E test: path page renders all 10 concept nodes with correct state chips; available node navigates to lesson; locked node is inert in apps/web/tests/e2e/learning-path.spec.ts

### Implementation for User Story 4

- [X] T071 [P] [US4] Implement concepts tRPC router (listConceptStates — returns ordered list with state for enrollment; exclude concepts with status=wip from results (FR-038)) in apps/api/src/router/concepts.ts
- [X] T072 [P] [US4] Storybook story for ConceptNode component (all 5 states: locked, available, in_progress, mastered, completed — including collapsed mastered with expand control) in packages/ui/src/components/ConceptNode.stories.tsx
- [X] T073 [P] [US4] Implement ConceptNode component (state-driven visual, collapsed/expanded mastered, locked = inert, available = navigable) in packages/ui/src/components/ConceptNode.tsx
- [X] T074 [US4] Implement LearningPath component (ordered ConceptNode list + capstone summary node at bottom) in apps/web/src/components/path/LearningPath.tsx
- [X] T075 [US4] Implement track path page in apps/web/src/app/tracks/[trackSlug]/page.tsx

**Checkpoint**: Learners can see and navigate their full learning path with accurate state across all P1 interactions.

---

## Phase 7: User Story 5 — Capstone Builder (Priority: P2)

**Goal**: A learner starts the Go CRUD API capstone, gets an isolated ephemeral PostgreSQL database, progresses through 6 steps with HTTP-level verification, and can resume from exactly where they left off.

**Independent Test**: Start a capstone session, poll until DB status is `connected`, submit step 1 code, verify the HTTP test suite passes and step 1 is marked complete. Close the browser, re-open, and verify the session resumes at step 2 with step 1 still showing completed.

### Tests for User Story 5 *(TDD: write first, must fail before implementation)*

- [X] T076 [P] [US5] Unit tests for CapstonSessionWorkflow (provision activity called, learner-active signal resets timer, inactivity causes teardown) in apps/capstone-runner/tests/unit/session-workflow.test.ts
- [X] T077 [P] [US5] Unit tests for verifier activity (verify.sh execution, HTTP test result parsing, pass/fail detection) in apps/capstone-runner/tests/unit/verifier.test.ts
- [X] T078 [P] [US5] Integration test: startCapstoneSession → poll until connected → verifyStep(1) → step 1 in capstone_step_completions in apps/api/tests/integration/capstone.test.ts
- [X] T079 [P] [US5] Integration test: close and re-open capstone session → current_step reflects last completed step in apps/api/tests/integration/capstone-resume.test.ts
- [X] T080 [P] [US5] E2E test: start capstone → DB panel shows connected → submit step 1 → step node shows checkmark → step 2 active in apps/web/tests/e2e/capstone.spec.ts

### Implementation for User Story 5

- [X] T081 [P] [US5] Implement provisioner activity (create K8s Job with learner code + Postgres sidecar, store job name + encrypted connection string) in apps/capstone-runner/src/activities/provisioner.ts
- [X] T082 [P] [US5] Implement verifier activity (run verify.sh inside the K8s Pod, parse JSON test output, return pass/fail per HTTP test) in apps/capstone-runner/src/activities/verifier.ts
- [X] T083 [P] [US5] Implement session activity (seed fixtures.sql, record step completion, report DB status; emit structured pino log per activity with session_id, step, duration_ms — FR-050) in apps/capstone-runner/src/activities/session.ts
- [X] T084 [US5] Implement CapstonSessionWorkflow (provision → wait for learner-active signals → 30-min inactivity timer → teardown) in apps/capstone-runner/src/workflows/capstone-session.ts
- [X] T085 [US5] Implement Temporal client helpers (startCapstoneWorkflow, signalLearnerActive) in apps/api/src/temporal/capstone-client.ts
- [X] T086 [US5] Implement capstone tRPC router (getCapstone, createSession, getSessionStatus, verifyStep) in apps/api/src/router/capstone.ts
- [X] T087 [P] [US5] Storybook story for CapstoneStepList component (step nodes: locked/current/completed; capstone progress indicator) in packages/ui/src/components/CapstoneStepList.stories.tsx
- [X] T088 [P] [US5] Implement CapstoneStepList component (step list with current/completed/locked visual states + overall progress bar) in packages/ui/src/components/CapstoneStepList.tsx
- [X] T089 [P] [US5] Storybook story for DatabaseStatusPanel component (provisioning/connected/error/expired states) in packages/ui/src/components/DatabaseStatusPanel.stories.tsx
- [X] T090 [P] [US5] Implement DatabaseStatusPanel component (DB connection status + expiry countdown) in packages/ui/src/components/DatabaseStatusPanel.tsx
- [X] T091 [US5] Implement useCapstoneSession hook (provision, poll DB status, signal learner-active on step interaction) in apps/web/src/hooks/use-capstone-session.ts
- [X] T092 [US5] Implement capstone page layout (CapstoneStepList + DatabaseStatusPanel + CodeEditor + verify output pane) in apps/web/src/app/tracks/[trackSlug]/capstone/page.tsx
- [X] T135 [P] [US5] Implement capstone prerequisite check service (verify all track concepts are mastered or completed before allowing session creation; return 422 with unmet_concepts list if not) in apps/api/src/service/capstone-prereq.ts and apps/api/src/router/capstone.ts

**Checkpoint**: Learners can complete the full capstone flow with a live database and HTTP verification.

---

## Phase 8: User Story 6 — Dashboard (Priority: P2)

**Goal**: A returning learner lands on a dashboard with their headline stats (concepts done, tested out, time saved, capstone progress), a direct "Continue building" card pointing to their current capstone step, and their upcoming concept queue.

**Independent Test**: After completing P1–P5 flows (some concepts mastered/completed, capstone in progress), log out, log back in, and verify the dashboard accurately reflects: the correct counts, the correct capstone step in the "Continue building" card, and the correct "time saved" estimate.

### Tests for User Story 6 *(TDD: write first, must fail before implementation)*

- [X] T093 [P] [US6] Unit tests for dashboard aggregation (stats correctly computed from enrollment + mastery_events + capstone_sessions) in apps/api/tests/unit/dashboard.test.ts
- [X] T094 [P] [US6] Integration test: GET /users/me/dashboard after simulated P1–P5 flows returns accurate stats and correct continue_building card in apps/api/tests/integration/dashboard.test.ts
- [X] T095 [P] [US6] E2E test: login → dashboard page shows correct stats and "Continue building" card navigates to active capstone step in apps/web/tests/e2e/dashboard.spec.ts

### Implementation for User Story 6

- [X] T096 [P] [US6] Implement dashboard tRPC router (getDashboard — aggregates stats, continue-building card, upcoming concepts, other tracks) in apps/api/src/router/dashboard.ts
- [X] T097 [P] [US6] Storybook story for DashboardStats component (4 headline metrics, empty/zero state, populated state) in packages/ui/src/components/DashboardStats.stories.tsx
- [X] T098 [P] [US6] Implement DashboardStats component (4 stat cards: concepts done, tested out, time saved, capstone %) in packages/ui/src/components/DashboardStats.tsx
- [X] T099 [P] [US6] Storybook story for ContinueBuildingCard component (mid-capstone state, no-progress state) in packages/ui/src/components/ContinueBuildingCard.stories.tsx
- [X] T100 [P] [US6] Implement ContinueBuildingCard component (current step title, Resume → button, start-track fallback) in packages/ui/src/components/ContinueBuildingCard.tsx
- [X] T101 [US6] Implement dashboard page (DashboardStats + ContinueBuildingCard + upcoming concepts list + other tracks panel) in apps/web/src/app/dashboard/page.tsx

**Checkpoint**: Returning learners land on an accurate, actionable dashboard.

---

## Phase 9: User Story 7 — Profile & Progress (Priority: P3)

**Goal**: A learner views their profile with a per-concept mastery table (status, how achieved, attempt metrics) and can generate and share a track completion credential.

**Independent Test**: After completing the full Go track, view the profile page and verify every concept appears in the mastery table with correct status and `achieved_via` values. Click "Share Go credential," verify a credential URL is returned, visit the URL, and confirm the credential displays the correct name, track, date, and tested-out count.

### Tests for User Story 7 *(TDD: write first, must fail before implementation)*

- [X] T102 [P] [US7] Unit tests for credential service (token generation, credential record creation, lookup by token) in apps/api/tests/unit/credential.test.ts
- [X] T103 [P] [US7] Integration test: GET /users/me/mastery/go returns correct table after mixed lesson + test-out completions in apps/api/tests/integration/profile-mastery.test.ts
- [X] T104 [P] [US7] Integration test: POST /users/me/credentials/go generates credential URL; GET /credentials/:token returns correct summary in apps/api/tests/integration/credential.test.ts
- [X] T105 [P] [US7] E2E test: profile page mastery table matches DB state; share credential generates valid URL in apps/web/tests/e2e/profile.spec.ts

### Implementation for User Story 7

- [X] T106 [P] [US7] Implement credential service (generate opaque token, store credential record, lookup for public page) in apps/api/src/service/credential.ts
- [X] T107 [P] [US7] Implement profile tRPC router (getProfile, getMastery, generateCredential) in apps/api/src/router/profile.ts
- [X] T108 [P] [US7] Storybook story for MasteryTable component (rows: lesson/tested-out/in-progress, best-run column) in packages/ui/src/components/MasteryTable.stories.tsx
- [X] T109 [P] [US7] Implement MasteryTable component (sortable rows: concept, status chip, how achieved, runs, best runtime) in packages/ui/src/components/MasteryTable.tsx
- [X] T110 [US7] Implement profile page (headline stats + progress bar + MasteryTable + "Share credential" button) in apps/web/src/app/profile/page.tsx
- [X] T111 [US7] Implement public credential page (shareable card: name, track, completion date, tested-out count) in apps/web/src/app/credentials/[token]/page.tsx

**Checkpoint**: Learners can view detailed mastery data and share a credential for completed tracks.

---

## Phase 10: User Story 8 — Content Authoring (Priority: P3)

**Goal**: A team engineer can author a new concept exercise as a folder in the Git repo, open a PR, have CI validate the schema and verify the exemplar passes its own tests, and see the exercise live to learners on merge.

**Independent Test**: Create a minimal valid exercise folder for a new concept, run `node tools/content-linter/dist/cli.js ./content/tracks/go/concepts/11-generics` and confirm exit 0. Then break the exemplar and confirm the linter exits 1 with error code E004.

### Tests for User Story 8 *(TDD: write first, must fail before implementation)*

- [X] T112 [P] [US8] Unit tests for content linter validator (E001–E008 error codes, valid folder = no errors) in tools/content-linter/src/validator.test.ts
- [X] T113 [P] [US8] Integration test: linter on a valid exercise folder exits 0; linter on broken exemplar exits 1 with E004 in tools/content-linter/tests/integration/linter.test.ts

### Implementation for User Story 8

- [X] T114 [P] [US8] Implement content linter validator (file structure check, config.json schema validation, error code emission) in tools/content-linter/src/validator.ts
- [X] T115 [P] [US8] Implement content linter runner (shells out to `go build` for stub, `go test ./...` for exemplar, parses exit codes) in tools/content-linter/src/runner.ts
- [X] T116 [US8] Implement linter CLI entrypoint (accept exercise path arg, run validator + runner, print results, exit 0/1) in tools/content-linter/src/cli.ts
- [X] T117 [US8] Add content-lint GitHub Actions workflow (runs linter on changed content/ paths) in .github/workflows/content-lint.yml
- [X] T118 [US8] Create Go track config.json and 10 concept stubs (status: wip, all required files present) in content/tracks/go/
- [X] T119 [US8] Create Go capstone config.json and 6-step stubs (verify.sh, fixtures.sql, stub/ scaffold) in content/capstone/go-crud-api/
- [X] T136 [US8] Add GitHub Actions content-preview workflow (on content/ PR: run linter, build manifest, post preview deploy URL as PR comment) in .github/workflows/content-preview.yml (FR-039)

**Checkpoint**: New exercises can be authored, validated by CI, and shipped to learners via PR.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Observability wiring, accessibility, load testing, and final validation — touches multiple stories.

- [X] T120 [P] Implement Prometheus counters and histograms for FR-051, FR-052 (sandbox execution count/duration, capstone DB pool, submission error rate) in apps/api/src/middleware/metrics.ts and apps/sandbox/src/middleware/metrics.ts
- [X] T121 [P] Configure Alertmanager alert rules for FR-052 thresholds (sandbox p95 > 10s, error rate > 5%, capstone provision failure > 1%) in infra/alertmanager/rules.yml
- [X] T122 [P] Implement prefers-reduced-motion support in Rosetta design system (disable CSS transitions for users who opt in) in packages/ui/src/themes/motion.css (FR-047)
- [X] T123 [P] Implement Rosetta light theme (swap semantic token layer only — no component changes) in packages/ui/src/themes/light.css and packages/ui/src/themes/index.ts
- [X] T124 [P] Add @axe-core/playwright accessibility checks to Playwright E2E suite (zero WCAG AA violations required per SC-009) in apps/web/tests/e2e/a11y.spec.ts
- [X] T125 [P] Implement k6 load test script (100 virtual users, concurrent code runs, assert p95 < 5s) in tests/load/concurrent-runs.js
- [X] T126 [P] Storybook stories for all remaining Rosetta primitives (Button, Input, Badge, Dialog, Tooltip, Select) in packages/ui/src/components/
- [X] T127 Run quickstart.md validation scenarios end-to-end (Scenarios 1–9) and confirm all pass
- [X] T128 [P] Final ESLint + TypeScript strict checks across all packages — zero errors required (Principle VIII)
- [X] T137 [P] Configure 30-day log retention in Prometheus and Loki (storage.tsdb.retention.time: 30d, chunk_retain_period: 30d) in infra/prometheus/config.yml and infra/loki/config.yml (FR-053)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — can start immediately after foundational
- **Phase 4 (US2)**: Depends on Phase 2 — can start immediately after foundational; execution queue setup (T020–T021) required
- **Phase 5 (US3)**: Depends on Phase 4 — test-out uses the same execution infrastructure as the lesson REPL
- **Phase 6 (US4)**: Depends on Phase 3 — path view reads enrollment and concept states
- **Phase 7 (US5)**: Depends on Phase 4 — capstone session needs the execution queue infrastructure and concept-state system
- **Phase 8 (US6)**: Depends on Phases 3–7 — dashboard aggregates enrollment, mastery, and capstone data
- **Phase 9 (US7)**: Depends on Phase 4 (US2) — profile mastery table reads from mastery_events created by lesson/testout flows; credential generation is a data condition (full track completion), not a code dependency on Phase 8
- **Phase 10 (US8)**: Independent of Phases 3–9 — can be worked in parallel with any story
- **Phase 11 (Polish)**: Depends on all prior phases

### User Story Dependencies

```
Phase 2 (Foundational)
    ├── Phase 3 (US1: Placement)
    │       └── Phase 6 (US4: Path) ← reads enrollment state
    ├── Phase 4 (US2: REPL)
    │       └── Phase 5 (US3: Test-Out) ← same execution queue
    │               └── Phase 7 (US5: Capstone) ← needs execution + concept state
    │                       └── Phase 8 (US6: Dashboard) ← aggregates all data
    │                               └── Phase 9 (US7: Profile)
    └── Phase 10 (US8: Authoring) ← independent, can run in parallel with any story
```

### Within Each User Story

1. Write tests first and confirm they FAIL (Red)
2. Models / services before routers
3. Routers before UI components
4. UI components (with Storybook) before pages
5. Pages before E2E tests can be verified green

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run simultaneously
- All Phase 2 tasks marked [P] can run simultaneously after T011–T012
- Within each story phase, all [P]-marked tasks can run simultaneously
- Phase 10 (US8: Content Authoring) can be worked entirely in parallel with Phases 3–9 by a separate engineer
- Storybook component tasks are always parallelizable with their corresponding service/router tasks (different files)

---

## Parallel Example: User Story 2 (Lesson + REPL)

```bash
# Launch all tests first (must fail):
[T039] Unit: streak service           # apps/api/tests/unit/streak.test.ts
[T040] Unit: mastery service          # apps/api/tests/unit/mastery.test.ts
[T041] Integration: execution job     # apps/sandbox/tests/integration/execution.test.ts
[T042] Integration: submission        # apps/api/tests/integration/submission.test.ts
[T043] Integration: rate limit        # apps/api/tests/integration/rate-limit.test.ts
[T044] E2E: lesson REPL flow          # apps/web/tests/e2e/lesson-repl.spec.ts

# Launch sandbox service tasks in parallel:
[T045] Judge0 client                  # apps/sandbox/src/executor/judge0-client.ts
[T046] Rate limiter                   # apps/sandbox/src/limiter/token-bucket.ts
[T047] BullMQ worker                  # apps/sandbox/src/worker/execution-worker.ts
[T048] SSE streamer                   # apps/sandbox/src/streamer/sse-streamer.ts

# Launch UI component tasks in parallel with sandbox:
[T054] CodeEditor Storybook story     # packages/ui/src/components/CodeEditor.stories.tsx
[T055] CodeEditor component           # packages/ui/src/components/CodeEditor.tsx
[T056] OutputPane Storybook story     # packages/ui/src/components/OutputPane.stories.tsx
[T057] OutputPane component           # packages/ui/src/components/OutputPane.tsx
```

---

## Implementation Strategy

### MVP Scope: All Phases (Phases 1–11)

The MVP encompasses the complete Fluent Platform — all 8 user stories plus polish. Delivery is incremental within the MVP; each phase produces a working, independently testable increment.

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — BLOCKS everything
3. Complete Phase 3 (US1: Placement) → validate independently
4. Complete Phase 4 (US2: REPL) → validate independently
5. Complete Phase 5 (US3: Test-Out) → demo the full P1 learning loop (enroll → place → lesson → run → test → test-out)
6. Complete Phase 6 (US4: Path) → learners can navigate their full track
7. Complete Phase 7 (US5: Capstone) → learners can build the real app
8. Complete Phase 8 (US6: Dashboard) → returning users have a home screen
9. Complete Phase 9 (US7: Profile) → mastery data is shareable
10. Complete Phase 10 (US8: Authoring) → content pipeline is ready for new concepts
11. Complete Phase 11 (Polish) → observability, accessibility, load testing, and final validation

### Incremental Delivery

- P1 complete (Phases 3–5) → demo the learning loop
- Add US4 (Path) → learners can navigate their full track
- Add US5 (Capstone) → learners can build the real app
- Add US6 (Dashboard) → returning users have a home screen
- Add US7 (Profile) → mastery data is shareable
- Add US8 (Authoring) → content pipeline is ready for new concepts

### Parallel Team Strategy (2 engineers after Phase 2)

- **Engineer A**: Phase 3 (US1) → Phase 5 (US3) → Phase 6 (US4)
- **Engineer B**: Phase 4 (US2, sandbox infrastructure) → Phase 7 (US5, capstone)
- **Engineer C (optional)**: Phase 10 (US8, content authoring) in parallel from day 1

---

## Notes

- [P] tasks have no file conflicts and can be dispatched simultaneously
- Every test task MUST fail before its implementation task begins (Principle IV — TDD NON-NEGOTIABLE)
- Every new component MUST have a Storybook story at the same time as the component (FR-048)
- Every new Rosetta component MUST use semantic tokens — never raw color or pixel values (FR-041, FR-042)
- Commit after each task or logical group; do not batch multiple tasks into one commit
- Stop at each phase checkpoint to validate the story independently before proceeding
