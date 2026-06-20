# Feature Specification: Fluent Platform — v1

**Feature Branch**: `001-fluent-platform`

**Created**: 2026-06-19

**Status**: Draft

**Input**: Full platform spec synthesized from 00-README.md, 01-Research-Notes.md, 02-PRD.md, 03-Architecture-and-Environments.md, 04-Design-System-Guide.md, 05-UI-Toolkit-PRD.md, and screen mockups 01–08.

---

## Platform Overview

Fluent is an interactive coding-education platform for engineers who already know how to program. It teaches a new language's syntax, idioms, and best practices — and lets learners skip concepts they already know by passing a short challenge. Every track builds toward one real, end-to-end application. The first track teaches Go by building a CRUD API with a live database.

**The core thesis:** No existing platform occupies the intersection of in-browser interactive execution + assumes-you-can-already-code + builds-a-real-app + lets-you-skip-what-you-know. Fluent owns that gap.

**Non-user:** Absolute beginners. The platform will not serve them and will not dilute to try.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Onboarding & Adaptive Placement (Priority: P1)

An experienced engineer arrives at Fluent wanting to learn Go. They select their starting confidence level — "New to Go," "Know the basics," or "Just need idioms" — to give the system a baseline. They can optionally take a short placement challenge across the key concepts of the track; every concept they pass is pre-marked mastered and collapses from their path before they ever see it. Engineers who prefer to discover gaps organically can skip placement entirely and test out lesson-by-lesson as they go.

**Why this priority**: Without placement, the platform has no way to differentiate itself from beginner-first competitors. Placement is the first proof that Fluent respects the learner's existing competence. An engineer who tests out of five concepts in the first five minutes is immediately sold on the product.

**Independent Test**: Can be fully tested by creating an account, selecting the Go track, choosing a starting point, completing the optional placement challenge, and verifying that the resulting path has the correct concepts pre-marked mastered and collapsed.

**Acceptance Scenarios**:

1. **Given** a new user on the Go track, **When** they select "Know the basics" and skip placement, **Then** their path opens with all concepts unlocked from the mid-point and no concepts pre-marked mastered.
2. **Given** a new user who takes the placement challenge, **When** they pass the challenge task for "Errors as values," **Then** that concept is immediately marked `mastered (tested out)` and collapses on their path before the lesson is ever opened.
3. **Given** a new user who fails a placement task, **When** they complete placement, **Then** the failed concept appears on their path as `available` (not mastered) with no penalty copy or friction.
4. **Given** a user mid-placement, **When** they click "Skip, I'll test out as I go," **Then** placement ends, no concepts are pre-marked, and they land on the full open path.
5. **Given** a returning user, **When** they revisit onboarding, **Then** their existing mastery state is preserved and they are not prompted to repeat placement.

---

### User Story 2 — Lesson + REPL: Learn a Concept Interactively (Priority: P1)

A learner opens a concept lesson. The left panel explains the concept in prose written for engineers — short, framed as "how this works in Go vs the language you already know." The right panel is a code editor pre-loaded with a starting stub. The learner edits code, runs it against a live sandbox, sees stdout/stderr/runtime streamed back in real time, and submits to run the hidden test suite. They see pass/fail results per test. At any point they can click "I already know this — test out" to jump to the challenge instead.

**Why this priority**: The lesson + REPL is the core value-delivery surface. Everything else (placement, profile, capstone) supports or extends it. An MVP that only delivers this screen — one concept with a working editor and test runner — is already a useful, demonstrable product.

**Independent Test**: Can be fully tested by opening a single concept lesson (e.g., "Goroutines, channels & context"), editing the stub, running the code, observing output, submitting to get test results, and verifying that "I already know this — test out" transitions to the test-out flow.

**Acceptance Scenarios**:

1. **Given** a learner with an `available` concept, **When** they open it, **Then** the lesson pane shows concept prose with a "vs your language" callout, and the editor pane shows the starter stub pre-loaded.
2. **Given** a learner in the editor, **When** they click Run (or press the run keyboard shortcut), **Then** their code executes in a sandbox and stdout/stderr/exit code/runtime are streamed to the output pane within 5 seconds for typical snippets.
3. **Given** a learner who clicks "Submit & check tests," **When** the hidden test suite runs, **Then** they see a pass/fail result per test and the concept advances to `completed` if all tests pass.
4. **Given** a learner with a failing submission, **When** tests fail, **Then** they see which specific tests failed, no penalty is applied, and the editor remains editable.
5. **Given** a learner in a lesson, **When** they click "I already know this — test out," **Then** the test-out modal opens without losing their current editor state.
6. **Given** a learner who resets the editor, **When** they confirm reset, **Then** the editor returns to the original stub, not blank.

---

### User Story 3 — Test-Out: Skip What You Know (Priority: P1)

A learner believes they already understand a concept. They click "I already know this — test out" to open a timed challenge: one harder code task with no walkthrough, no hints, and hidden tests. If they pass, the concept is marked mastered and collapses on their path — they never see that lesson again unless they choose to reopen it. If they fail, they drop into the normal guided lesson with no shame copy and no time penalty.

**Why this priority**: Test-out is the product's primary differentiator. Without it, Fluent is just another interactive tutorial. With it, a senior engineer can skip six of ten concepts in a single session and reach the capstone in hours rather than days.

**Independent Test**: Can be fully tested by opening the test-out modal for any concept, submitting code, and verifying the correct state transition — either `mastered` with the concept collapsing on the path, or a graceful drop into the lesson.

**Acceptance Scenarios**:

1. **Given** a learner who opens the test-out modal, **When** the modal appears, **Then** a 4-minute countdown timer is visible, the challenge code file is pre-loaded with a function stub and the task description, and no hints or walkthrough are shown.
2. **Given** a learner who submits code that passes all hidden tests, **When** the result arrives, **Then** the concept is marked `mastered`, the timer stops, the modal closes, and the concept node on the path collapses with a "tested out" label.
3. **Given** a learner who submits code that fails hidden tests, **When** the result arrives, **Then** the modal closes gracefully, the concept opens as a normal guided lesson, and no penalty copy ("wrong," "failed") is shown — only neutral test-result feedback.
4. **Given** a learner who lets the timer expire, **When** the timer reaches 0:00, **Then** the challenge is treated the same as a failing submission — drop into the lesson, no penalty.
5. **Given** a learner in the test-out modal, **When** they click "I'd rather do the lesson," **Then** the modal closes and the normal lesson opens.
6. **Given** a learner who tested out of a concept, **When** they revisit their path, **Then** that concept node is collapsed but re-openable so they can review the material if they choose.

---

### User Story 4 — Learning Path: Navigate and Track Progress (Priority: P2)

A learner views their personalized track — a vertical map of all concepts and the capstone for a given language. Each node shows its title, a one-line description of what it teaches, and its current state: locked, available, in progress, mastered (tested out), or completed. The learner can see at a glance where they are, what's next, and how far they've come. Mastered concepts are collapsed but tappable. Locked concepts are visible but not openable.

**Why this priority**: The path view is essential for orientation and motivation, but learners can get the P1 experience (open a lesson, run code) without a full path view. A minimal path can be shipped as a simple list before building the full visual treatment.

**Independent Test**: Can be fully tested by navigating to the Go track path, verifying that all 10 concepts and the capstone are rendered with correct states reflecting the learner's actual progress, and that clicking an available concept navigates to its lesson.

**Acceptance Scenarios**:

1. **Given** a learner on the track path view, **When** the page loads, **Then** all concept nodes are shown in order with their correct state: locked, available, in progress, mastered, or completed.
2. **Given** a learner who tested out of a concept, **When** they view the path, **Then** that concept node is collapsed and labeled "tested out" but has a control to expand and view the lesson content.
3. **Given** a learner who clicks an `available` concept node, **When** they click it, **Then** they navigate to that concept's lesson.
4. **Given** a learner on a `locked` concept node, **When** they try to open it, **Then** nothing happens (or a tooltip explains prerequisites); the node is not navigable.
5. **Given** a learner who completes a concept, **When** they return to the path, **Then** that concept node shows `completed` and the next concept unlocks to `available`.
6. **Given** a learner viewing the path, **When** the capstone is visible at the bottom, **Then** it shows how many prerequisite concepts are complete, its multi-step structure, and its current step progress.

---

### User Story 5 — Capstone Builder: Assemble a Real Application (Priority: P2)

A learner who has completed (or tested out of) the prerequisite concepts reaches the capstone — a multi-step guided project. For the Go track, this is building a CRUD `/items` REST API using only the standard library and a real database. The learner progresses step by step: project setup → data model → HTTP handlers → wire to the database → tests. At each step they see the task description, edit code in the editor, and run HTTP-level verification against their running application and a provisioned ephemeral database. Steps completed stay green; the current step is highlighted.

**Why this priority**: The capstone is the product's headline outcome — "you built a real app." It is what senior engineers actually want: not more quizzes, but a complete artifact they shipped. It comes after the lesson/test-out loop because it depends on those concepts being in place.

**Independent Test**: Can be fully tested by starting the capstone on the Go track, completing step 1 (project & router), verifying that the step is marked complete and step 2 unlocks, and confirming that the database panel shows "connected" with the correct schema.

**Acceptance Scenarios**:

1. **Given** a learner who starts the capstone, **When** the capstone view opens, **Then** they see the step list (e.g., 6 steps for the CRUD API), step 1 is the current step, and a database panel shows the ephemeral database connection status.
2. **Given** a learner on a capstone step, **When** they click "Run & [test]," **Then** real HTTP requests are made against their running code and the database, and pass/fail is shown with the actual HTTP response.
3. **Given** a learner who passes all tests for the current step, **When** the step completes, **Then** it is marked with a checkmark, the next step becomes active, and the overall capstone progress indicator advances.
4. **Given** a learner who closes the browser mid-capstone, **When** they return, **Then** their code changes for completed steps are preserved and the current step is where they left off.
5. **Given** a learner on any capstone step, **When** the database panel shows "connected," **Then** the database is seeded with the fixtures defined for that step and is isolated from any other learner's session.
6. **Given** a learner who completes all steps, **When** the final step passes, **Then** they see a completion state indicating the application is fully built and prompting them to view their profile credential.

---

### User Story 6 — Dashboard: Resume and Understand Your Learning at a Glance (Priority: P2)

A returning learner lands on their dashboard. They see their headline stats — concepts completed, concepts tested out, time saved by testing out, and capstone progress — plus a "Continue building" card that drops them directly back into their current capstone step. They also see their upcoming concept queue and what other tracks are available or coming soon.

**Why this priority**: The dashboard is the re-engagement surface. Without it, returning users must navigate manually to find their place. It also surfaces the "time saved by testing out" metric — the key proof point that the platform respects their experience.

**Independent Test**: Can be fully tested by logging out, logging back in, and verifying that the dashboard accurately reflects progress: correct concept counts, correct capstone step in the "Continue building" card, and correct "tested out" count.

**Acceptance Scenarios**:

1. **Given** a returning learner who lands on the dashboard, **When** the page loads, **Then** they see four headline stats: concepts done (X/total), tested out count, time saved, and capstone progress percentage.
2. **Given** a learner mid-capstone, **When** they view the dashboard, **Then** the "Continue building" card shows the exact current capstone step and a "Resume →" button that navigates directly to it.
3. **Given** a learner with an active concept in progress, **When** they view "Up next on your path," **Then** they see their mastered, current, and next concepts with their states labeled.
4. **Given** a learner who views the "Other tracks" panel, **When** non-Go tracks are listed, **Then** they appear with a "coming soon" label and are not navigable (no false promises of available content).
5. **Given** a first-time user with no progress, **When** they view the dashboard, **Then** the stats show zeros, the "Continue building" card prompts them to start the track, and "Up next" shows their full open path.

---

### User Story 7 — Profile & Progress: Own and Share Your Mastery (Priority: P3)

A learner views their profile: a summary of who they are, their headline stats, and a full mastery table breaking down every concept by status (mastered, completed, in progress), how they achieved it (lesson or tested out), and any attempt metrics. A "Share Go credential" button lets them share proof of track completion.

**Why this priority**: Profile is motivating but not critical to learning. It comes after all the core learning surfaces are in place. The shareable credential is deliberately lightweight — for senior engineers, the proof is the capstone they built, not a badge.

**Independent Test**: Can be fully tested by completing or testing out of multiple concepts and verifying that the mastery table reflects exact status, method (lesson / tested out), and attempt data for each concept.

**Acceptance Scenarios**:

1. **Given** a learner on their profile, **When** the page loads, **Then** they see their display name, role, track, join date, and four headline stats: concepts learned, tested out, time saved, and day streak.
2. **Given** a learner with completed concepts, **When** they view the Go Track Mastery table, **Then** each concept they have interacted with appears with its status (mastered/completed/in progress), how it was achieved (lesson/tested out), and attempt/run data.
3. **Given** a learner who tested out of a concept, **When** they view that concept's row, **Then** the "How" column shows "tested out" and "Best run" shows "— skipped" (because they never ran the lesson).
4. **Given** a learner who completes the full Go track, **When** they click "Share Go credential," **Then** a shareable link or card is generated that displays their name, track, completion date, and concepts-tested-out count.
5. **Given** a learner viewing the overall progress bar, **When** the bar renders, **Then** it accurately reflects the ratio of completed+mastered concepts to total concepts plus capstone progress.

---

### User Story 8 — Content Authoring: Add Languages and Lessons via Pull Request (Priority: P3)

An engineer on the Fluent team wants to add a new concept lesson to the Go track. They open a pull request containing a new exercise folder with a prose explainer, a starter code stub, an idiomatic reference solution, and a hidden test suite. A CI linter validates the structure automatically. The PR preview environment renders the new lesson exactly as a learner will see it. When the PR merges, the lesson is live. New content can ship in a `wip` state and graduate later — no platform code change is required for any of this.

**Why this priority**: The authoring system is internal and does not affect learners directly. It is essential for the team's ability to grow the content library, but the product is launchable with manually seeded content before the authoring system is fully polished.

**Independent Test**: Can be fully tested by creating a new exercise folder in the correct schema, opening a PR, verifying CI linter passes, confirming the preview environment shows the lesson correctly, and merging to verify the lesson is accessible to learners.

**Acceptance Scenarios**:

1. **Given** an engineer who creates a new exercise folder with all required files (instructions, config, stub, exemplar, tests), **When** they open a PR, **Then** the CI linter runs, validates the structure, and passes — allowing the PR to merge.
2. **Given** an engineer whose PR violates the track schema (e.g., missing a required file), **When** CI runs, **Then** the linter fails with a specific error identifying the missing element, and the PR cannot merge.
3. **Given** a merged PR with a new exercise, **When** a learner navigates to that concept, **Then** the lesson is visible and functional with no platform deployment required.
4. **Given** an engineer who marks an exercise `status: wip` in the config, **When** they open a PR, **Then** CI allows the PR to merge despite incomplete content, and the exercise is visible in the authoring preview but hidden from learners.
5. **Given** a content PR that adds a new track-level language folder, **When** it merges, **Then** the new language appears in the platform's track list for learners without any platform code change.
6. **Given** a PR open for review, **When** the reviewer opens the auto-generated preview environment URL, **Then** they can navigate the new or changed content exactly as a learner would, including running code and seeing test results.

---

### Edge Cases

- A learner runs malicious or infinite-loop code: the sandbox must enforce wall-clock and CPU time limits and terminate the execution, returning a clear timeout message within a fixed ceiling (e.g., 10 seconds). The learner's session and other learners' sessions are unaffected.
- A learner's capstone database session crashes or times out mid-step: the system provisions a fresh ephemeral database, the learner sees a clear reconnect prompt, and their code edits are not lost.
- A learner tests out of every concept: the capstone unlocks immediately; the path shows all concepts collapsed as `mastered`; the dashboard "tested out" count reflects the full number.
- A learner opens the test-out modal and immediately clicks "I'd rather do the lesson" without submitting: the lesson opens cleanly with no state side effects.
- Two learners submit code at the same moment: each submission runs in a fully isolated sandbox; there is no shared state, no queue-visible interference, and no result cross-contamination.
- Content authoring: an engineer submits an exemplar that does not pass its own test suite. The CI linter must catch this and fail the PR before it can reach learners.
- A learner with a 4-day streak misses a day: the streak resets to 0. No punitive copy — simply a neutral count.
- A learner on a slow connection runs code: the run button shows a loading state; output streams as soon as it is available rather than waiting for full completion.
- A learner submits code at very high frequency (e.g., rapid repeated runs): after exceeding a per-learner run threshold within a short window, the system shows a "please wait X seconds" message and defers the next execution — the run button remains visible but non-actionable until the cooldown elapses. No permanent penalty is applied.

---

## Requirements *(mandatory)*

### Functional Requirements

**Onboarding & Placement**

- **FR-001**: The system MUST allow a learner to select a starting confidence level ("New to Go," "Know the basics," "Just need idioms") at the beginning of a new track enrollment.
- **FR-002**: The system MUST present an optional placement challenge of 5–8 code tasks covering the key concepts of the track.
- **FR-003**: For each placement task the learner passes, the system MUST pre-mark the corresponding concept as `mastered` and collapse it on the learner's path before they begin the track.
- **FR-004**: The system MUST allow a learner to skip placement entirely and access the full open track.
- **FR-005**: The placement challenge MUST be skippable at any point mid-flow without penalty.

**Learning Path**

- **FR-006**: The system MUST render a learner's track as an ordered list of concept nodes, each with a title, one-line description, and one of five states: `locked`, `available`, `in progress`, `mastered`, `completed`.
- **FR-007**: The system MUST unlock the next concept node when the current concept reaches `mastered` or `completed`.
- **FR-008**: The system MUST persist and restore a learner's exact path state across sessions.
- **FR-009**: Mastered concept nodes MUST be collapsed by default but re-openable by the learner.

**Lesson + REPL**

- **FR-010**: Each concept lesson MUST display: a prose explainer with "vs other languages" framing, a code editor pre-loaded with a starter stub, a run control, and an output pane for stdout/stderr/exit code/runtime.
- **FR-011**: The system MUST execute submitted code in a sandboxed environment and stream the output (stdout, stderr, exit code, runtime) to the learner's output pane.
- **FR-012**: The system MUST enforce execution resource limits (wall-clock time, CPU, memory) and return a clear timeout or over-limit message when exceeded.
- **FR-013**: Learner code submissions MUST be isolated from all other learners' sessions — no shared execution context, filesystem, or state.
- **FR-014**: The system MUST run a hidden test suite on "Submit" and display pass/fail status per test.
- **FR-015**: Passing all tests on submission MUST advance the concept to `completed` and unlock the next node.
- **FR-016**: The editor MUST provide a "Reset" control that restores the original stub.
- **FR-016a**: The system MUST enforce a per-learner run rate limit. When a learner exceeds the threshold within a short window, the system MUST display a "please wait" message with a countdown and defer the next execution until the cooldown elapses. No permanent penalty or account action is taken.
- **FR-017**: Every lesson MUST include a persistent "I already know this — test out" trigger visible at all times.

**Test-Out Flow**

- **FR-018**: The test-out modal MUST present a single timed challenge (4-minute default countdown) with a code task harder than the lesson task, no hints, and no walkthrough.
- **FR-019**: Passing the hidden tests in the test-out challenge MUST mark the concept `mastered` (with `achieved_via: test_out`), close the modal, and collapse the concept node on the path.
- **FR-020**: Failing the test-out challenge or letting the timer expire MUST drop the learner into the normal guided lesson with no penalty label and no reduction in available attempts.
- **FR-021**: The test-out modal MUST include an "I'd rather do the lesson" escape that dismisses the modal and opens the normal lesson.

**Capstone Builder**

- **FR-022**: The capstone MUST be a multi-step guided project (6 steps for the Go CRUD API) with step-level pass/fail verification using real HTTP requests against the learner's running code.
- **FR-023**: The capstone MUST provision an isolated ephemeral database for each learner session, seeded from the exercise's fixture data.
- **FR-024**: The ephemeral database MUST be torn down at the end of the session or after a fixed inactivity timeout, whichever comes first.
- **FR-025**: Completed capstone steps MUST persist across sessions so a learner can resume from their last completed step.
- **FR-026**: The capstone MUST display real-time database connection status and step progress.

**Dashboard**

- **FR-027**: The dashboard MUST display four headline stats: concepts completed (X/total), concepts tested out, time saved by testing out, and capstone progress percentage.
- **FR-028**: The dashboard MUST show a "Continue building" card pointing to the learner's current capstone step with a direct navigation action.
- **FR-029**: The dashboard MUST show upcoming concept nodes with their states (mastered, current, next).
- **FR-030**: The dashboard MUST list other available tracks with their availability status.

**Profile & Progress**

- **FR-031**: The profile MUST display a mastery table per track listing every interacted concept with its status, how it was achieved (lesson / tested out), and attempt metrics.
- **FR-032**: The system MUST surface "time saved by testing out" as a prominent headline metric on the profile and dashboard.
- **FR-033**: A learner who completes a full track MUST be able to generate and share a track credential.
- **FR-034**: The system MUST track and display a daily learning streak.

**Content Authoring**

- **FR-035**: A new concept exercise MUST be addable to any track by creating a folder in the Git repository with the required schema: instructions, config metadata, starter stub, idiomatic reference solution, and hidden test suite.
- **FR-036**: A CI linter MUST validate track structure on every pull request and block merge if the schema is violated.
- **FR-037**: The CI linter MUST verify that the reference solution passes its own test suite before a PR can merge.
- **FR-038**: Exercises MUST support a `wip` status that allows merging with incomplete content, with the exercise hidden from learners until graduated to `active`.
- **FR-039**: Every pull request to the content repository MUST generate a preview environment where the changed content is accessible exactly as learners would see it.
- **FR-040**: Adding a new language track MUST require only a new top-level track folder — no platform code change.

**Observability**

- **FR-049**: Every sandbox code execution MUST emit a structured log entry containing: learner identifier, concept identifier, execution outcome (pass/fail/timeout/error), wall-clock duration, and timestamp.
- **FR-050**: Every capstone database provisioning and teardown event MUST emit a structured log entry containing: learner identifier, capstone step, event type (provisioned/torn down/crashed), and timestamp.
- **FR-051**: The platform MUST expose metrics for: active concurrent sandbox executions, sandbox execution latency (p50/p95/p99), capstone DB pool utilization, and submission error rate.
- **FR-052**: The platform MUST alert on-call when any of the following thresholds are breached: sandbox execution p95 latency exceeds 10 seconds, submission error rate exceeds 5% over a 5-minute window, or capstone DB provisioning failure rate exceeds 1%.
- **FR-053**: All metric and log data MUST be retained for a minimum of 30 days to support debugging and incident review.

**Rosetta Design System**

- **FR-041**: All UI in the platform MUST be built from the Rosetta component library (`@fluent/ui`). Feature code MUST NOT write bespoke CSS for visual values (color, spacing, radius, typography).
- **FR-042**: All visual values MUST be defined as named design tokens in a single source of truth. Components MUST reference tokens, never raw color or pixel values.
- **FR-043**: The platform MUST default to a dark theme. A light theme MUST be achievable by swapping the token layer with no component changes.
- **FR-044**: All interactive components MUST meet WCAG AA contrast requirements (4.5:1 for text, 3:1 for UI elements) and MUST display a visible focus indicator.
- **FR-045**: All interactive behavior (dialogs, dropdowns, menus, keyboard navigation) MUST use WAI-ARIA compliant primitives.
- **FR-046**: Color MUST never be the sole indicator of status — every status signal MUST include an accompanying text label or icon.
- **FR-047**: The system MUST respect `prefers-reduced-motion` and disable motion transitions for users who have opted into reduced motion.
- **FR-048**: The Rosetta component library MUST include Storybook documentation showing all component states. New components MUST not ship without a corresponding Storybook story.

### Key Entities

- **User**: A learner account — identity, join date, active track, streak, and enrollment records.
- **Track**: A complete language curriculum — ordered concepts, exercises, and a capstone. One track per language.
- **Concept**: A single teachable idea within a track — title, description, prerequisite concepts, and test-out gate.
- **Exercise**: The concrete lesson artifact for a concept — prose explainer, starter stub, reference solution, and hidden test suite. Versioned in Git.
- **Enrollment**: A user's participation in a track — start date, current concept, overall progress.
- **ConceptState**: The state of a single concept for a single learner — one of `locked`, `available`, `in_progress`, `mastered`, `completed` — plus how it was achieved (`placement`, `test_out`, `lesson`).
- **Submission**: A single code run or test-suite execution — code snapshot, stdout/stderr, exit code, runtime, memory, pass/fail per test, timestamp.
- **MasteryEvent**: A record of when and how a learner achieved mastery of a concept — drives the "time saved" metric.
- **CapstoneSess**: A learner's active capstone session — current step, ephemeral database connection, step completion history.
- **CapstoneStep**: One step of a multi-step capstone project — task description, verification method (HTTP tests), and fixture data.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of new learners who reach the REPL execute their first code run within the first session.
- **SC-002**: Learners who take placement test out of an average of 3 or more concepts before ever opening a lesson.
- **SC-003**: The average senior engineer (self-identified 3+ years) completes the Go track — including the full CRUD capstone — in 6 hours or fewer of active learning time.
- **SC-004**: Code submission results (run output) are visible to the learner within 5 seconds for at least 95% of lesson-level snippet runs under normal load.
- **SC-005**: Capstone step verification (HTTP tests against a live running application) completes within 30 seconds for at least 95% of submissions.
- **SC-006**: At least 50% of learners who start the Go track complete at least one capstone step (indicating the track drives toward a real deliverable, not just quizzes).
- **SC-007**: The "concepts tested out" metric averages at least 2 per learner across all users — proving the platform is serving experienced engineers, not beginners.
- **SC-008**: A new concept lesson can be authored, reviewed, and made live to learners within 3 business days of an engineer starting the pull request.
- **SC-009**: The Rosetta component library passes all WCAG AA contrast and focus-indicator checks with zero violations in automated accessibility audit across all components.
- **SC-010**: A new page in the product can be built by a feature engineer without writing any new CSS — verified by zero new CSS rules outside the `@fluent/ui` package in feature-level code.
- **SC-011**: The platform MUST sustain at least 100 concurrent active learners (each with an open lesson or running sandbox) with no degradation in SC-004 (run output within 5 seconds) or SC-005 (capstone verification within 30 seconds).
- **SC-012**: The platform MUST achieve 99.5% uptime (< 43.8 hours downtime per year), measured across all learner-facing surfaces. Planned maintenance windows communicated in advance do not count against this target.

---

## Clarifications

### Session 2026-06-19

- Q: What is the target concurrent learner count for v1? → A: ~100 concurrent learners (private beta / early access)
- Q: What should happen when a learner submits code at very high frequency? → A: Soft throttle — show a "please wait X seconds" message and defer; no hard block or permanent penalty
- Q: What level of observability is required in v1? → A: Full observability — structured logging + metrics (p50/p95/p99 latency, error rate, pool utilization) + alerting on breach of defined thresholds
- Q: Is v1 registration open or gated? → A: Open sign-up — any visitor can create an account and access the Go track immediately
- Q: What is the availability target for v1? → A: 99.5% uptime (< 43.8 hours downtime/year); planned maintenance windows excluded

---

## Assumptions

- Target learners have at least 3 years of programming experience in at least one language; the platform will not explain what a loop or variable is.
- The Go track is the first and primary track for v1; all other language tracks are "coming soon" and not functional.
- Authentication exists but is treated as a solved problem for this specification — registration is open (any visitor can create an account and access the Go track immediately); the auth method (email/password, OAuth, etc.) is a separate decision.
- Mobile support (phone/tablet) is out of scope for v1; the platform is desktop/laptop browser first.
- Placement challenge tasks and lesson test suites are pre-authored content; this spec does not cover the mechanics of writing those tasks, only that they exist and are run against.
- The shareable track credential in v1 is lightweight — a link or embeddable card — not a verifiable certificate with third-party signing.
- A learner's streak is defined as consecutive calendar days with at least one code submission; the exact timezone handling is a detail to be specified during planning.
- Pricing and billing are entirely out of scope for this specification.
- The "time saved by testing out" metric is computed as an estimate based on the average time spent by learners who complete a concept via the lesson (not the test-out path); the exact calculation formula is a planning detail.
- The Rosetta design system (`@fluent/ui`) is internal to the Fluent monorepo in v1 and is not published externally or shared with other products.
- The dark theme is the only fully designed and implemented theme for v1; the light theme is a token-swap fast follow with no separate design sign-off required.
