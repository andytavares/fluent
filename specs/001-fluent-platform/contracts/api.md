# API Contract: Fluent Platform tRPC API

**Service**: `apps/api` (TypeScript/Fastify + tRPC) | **Revised**: 2026-06-21 | **Plan**: [plan.md](../plan.md)

All procedures are accessed via tRPC over `POST /trpc/{router}.{procedure}` (batched via `httpBatchLink`). The web app proxies `/api/trpc/*` to the API at `$API_URL/trpc/*`.

**Auth**: Auth.js v5 database sessions. The API validates the `authjs.session-token` cookie by looking up the session in the `sessions` table. Procedures marked **protected** throw `UNAUTHORIZED` if the cookie is absent or expired.

---

## `tracks`

### `tracks.listTracks` — public query

Returns all tracks (including `coming_soon`).

**Output**: `Track[]` (Prisma model)

---

### `tracks.getTrack` — public query

**Input**: `{ slug: string }`
**Output**: `Track`

---

### `tracks.listConcepts` — public query

**Input**: `{ trackSlug: string }`
**Output**: `Concept[]` ordered by `position`. Filters `status: "published"` — `wip` concepts are hidden.

---

### `tracks.getConceptLesson` — protected query

**Input**: `{ trackSlug: string, conceptSlug: string }`
**Output**: `Concept & { instructions: string, stub: string, nextConceptSlug: string | null, language: string }`

Reads `instructions.md` and the stub file from `content/tracks/{trackSlug}/concepts/{slug}/` at runtime.

---

## `enrollments`

### `enrollments.createEnrollment` — protected mutation

**Input**: `{ trackId: string (uuid) }`

Creates an enrollment and initial `ConceptState` rows (first concept `available`, rest `locked`). Idempotent — returns existing enrollment if already enrolled.

**Output**: `Enrollment`

---

### `enrollments.resetEnrollment` — protected mutation

**Input**: `{ trackId: string (uuid) }`

Deletes the enrollment and all associated progress (concept states, mastery events, submissions, capstone sessions). Returns `null` if not enrolled.

---

### `enrollments.getEnrollment` — protected query

**Input**: `{ trackId: string (uuid) }`
**Output**: `Enrollment & { conceptStates: ConceptState[] }` or `null`

---

## `concepts`

### `concepts.getConceptState` — protected query

**Input**: `{ enrollmentId: string (uuid), conceptSlug: string }`
**Output**: `ConceptState & { concept: Concept }`

---

### `concepts.startLesson` — protected mutation

**Input**: `{ enrollmentId: string (uuid), conceptSlug: string }`

Transitions state from `available` → `in_progress` if currently `available`. No-op otherwise.

**Output**: `ConceptState`

---

## `placement`

### `placement.startPlacement` — protected mutation

**Input**: `{ enrollmentId: string (uuid) }`

Selects the first batch of published concepts from the track and returns their test-out stubs for the placement challenge.

**Output**: `{ placementId: string, tasks: PlacementTask[] }`

Each `PlacementTask`: `{ conceptId, conceptSlug, stub, taskNumber, totalTasks }`

---

### `placement.submitTask` — protected mutation

**Input**: `{ placementId: string (uuid), conceptId: string (uuid), code: string, language: string }`

Enqueues a test-suite job for the placement task. Returns a stream token.

**Output**: `{ submissionId: string, streamToken: string }`

---

### `placement.skipPlacement` — protected mutation

**Input**: `{ enrollmentId: string (uuid) }`

Abandons placement. No mastery events are created. Unlocks the first concept normally.

**Output**: `void`

---

## `submissions`

### `submissions.createSubmission` — protected mutation

**Input**:
```ts
{
  conceptId: string;     // uuid
  exerciseId?: string;   // uuid
  code: string;
  language?: string;     // default "go"
  isSuite: boolean;      // false = run-only, true = run test suite
}
```

Creates a `Submission` row, enqueues a BullMQ job, stores the stream token in Redis, and returns the token.

**Output**: `{ submissionId: string, streamToken: string }`

The browser opens an SSE connection to `/api/stream/{streamToken}` to receive execution output.

---

### `submissions.getSubmission` — protected query

**Input**: `{ id: string (uuid) }`
**Output**: `Submission` (throws `FORBIDDEN` if submission belongs to another user)

---

### `submissions.completeSubmission` — protected mutation

**Input**:
```ts
{
  submissionId: string;
  enrollmentId: string;
  stdout?: string;
  stderr?: string;
  exitCode: number;
  runtimeMs: number;
  timedOut: boolean;
  passed?: boolean;      // only meaningful when isSuite=true
}
```

Updates the submission record with results. Updates the user's streak. If `isSuite && passed`, creates a `MasteryEvent` and advances concept state via `MasteryService`.

**Output**: `Submission`

---

## `testout`

### `testout.startTestout` — protected mutation

**Input**: `{ enrollmentId: string (uuid), conceptId: string (uuid) }`
**Output**: `{ testoutId: string, stub: string, expiresAt: Date }`

---

### `testout.submitTestout` — protected mutation

**Input**: `{ testoutId: string (uuid), code: string, language: string }`
**Output**: `{ submissionId: string, streamToken: string }`

---

## `capstone`

### `capstone.getCapstone` — protected query

**Input**: `{ trackSlug: string }`
**Output**: `{ track: Track, enrollment: Enrollment, session: CapstoneSession & { stepCompletions } | null }`

---

### `capstone.createSession` — protected mutation

**Input**: `{ enrollmentId: string (uuid) }`

Checks all concepts are mastered/completed (prereq gate). Resumes an existing active session if present. Otherwise creates a `CapstoneSession` row and starts a Temporal workflow (`capstone-sessions` task queue).

**Output**: `CapstoneSession`

---

### `capstone.getSessionStatus` — protected query

**Input**: `{ sessionId: string (uuid) }`

Returns session with step completions. Also sends a `learner-active` signal to the Temporal workflow to reset the 30-minute inactivity timer.

**Output**: `CapstoneSession & { stepCompletions: CapstoneStepCompletion[] }`

---

### `capstone.verifyStep` — protected mutation

**Input**: `{ sessionId: string (uuid), stepNumber: number }`

Signals learner activity and returns a pending verification status. Actual HTTP verification is run by the Temporal `verify` activity.

**Output**: `{ sessionId: string, stepNumber: number, status: "pending" }`

---

## `dashboard`

### `dashboard.getDashboard` — protected query

**Input**: `{ trackSlug: string }`
**Output**: Dashboard stats, concept states, capstone progress, streak.

---

## `profile`

### `profile.getProfile` — protected query

**Output**: User profile with stats and streak.

---

## `internal`

Internal procedures used by the Next.js server (not the browser). Not exposed to the public.

---

## Auth flow

Auth.js v5 handles sign-in at `/api/auth/*` (GitHub OAuth + email magic link + dev credentials in `NODE_ENV=development`). Sessions are stored in the `sessions` DB table. The API reads the `authjs.session-token` cookie on every request and validates it against the DB — no JWTs involved.
