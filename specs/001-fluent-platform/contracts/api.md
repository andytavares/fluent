# API Contract: Fluent Platform REST API

**Service**: `apps/api` (Go, chi router) | **Date**: 2026-06-19 | **Plan**: [plan.md](../plan.md)

Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <token>` unless marked **public**. Tokens are JWTs issued by Auth.js. Errors follow `{"error": "<message>", "code": "<machine_code>"}`.

---

## Authentication

Handled by Auth.js in `apps/web`. The API validates JWTs from Auth.js. No dedicated auth endpoints in `apps/api` — Auth.js manages `/api/auth/*` routes in Next.js directly.

---

## Tracks

### `GET /tracks` — public

Returns all tracks with their availability status.

**Response 200**:
```json
{
  "tracks": [
    {
      "slug": "go",
      "title": "Go",
      "description": "Build a production CRUD API in Go",
      "status": "active",
      "concept_count": 10
    },
    {
      "slug": "rust",
      "title": "Rust",
      "status": "coming_soon",
      "concept_count": 0
    }
  ]
}
```

---

### `GET /tracks/:trackSlug` — public

Returns full track detail including ordered concept list.

**Response 200**:
```json
{
  "slug": "go",
  "title": "Go",
  "status": "active",
  "version": "1.0.0",
  "concepts": [
    {
      "slug": "variables-and-types",
      "title": "Variables & Types",
      "description": "Declare and use variables, constants, and Go's basic type system",
      "order_index": 1,
      "has_testout": true
    }
  ]
}
```

**Errors**: `404 track_not_found`

---

## Enrollments

### `POST /enrollments`

Enroll the authenticated learner in a track. Creates concept_states for all concepts (first = `available`, rest = `locked`).

**Request**:
```json
{ "track_slug": "go" }
```

**Response 201**:
```json
{
  "enrollment_id": "<uuid>",
  "track_slug": "go",
  "started_at": "<iso8601>"
}
```

**Errors**: `409 already_enrolled`, `404 track_not_found`, `400 track_not_active`

---

### `GET /enrollments/:enrollmentId`

Returns enrollment summary with concept state counts.

**Response 200**:
```json
{
  "enrollment_id": "<uuid>",
  "track_slug": "go",
  "started_at": "<iso8601>",
  "concept_counts": {
    "total": 10,
    "locked": 4,
    "available": 1,
    "in_progress": 1,
    "mastered": 2,
    "completed": 2
  },
  "capstone_progress": {
    "current_step": 2,
    "total_steps": 6,
    "completed_steps": [1]
  }
}
```

---

## Concept States & Lessons

### `GET /enrollments/:enrollmentId/concepts`

Returns all concept states for the learner's enrollment. Used to render the learning path.

**Response 200**:
```json
{
  "concepts": [
    {
      "slug": "variables-and-types",
      "title": "Variables & Types",
      "order_index": 1,
      "state": "completed",
      "achieved_via": "lesson",
      "state_entered_at": "<iso8601>"
    },
    {
      "slug": "functions-and-errors",
      "order_index": 2,
      "state": "mastered",
      "achieved_via": "test_out",
      "state_entered_at": "<iso8601>"
    }
  ]
}
```

---

### `GET /enrollments/:enrollmentId/concepts/:conceptSlug`

Returns the lesson content and current state for one concept.

**Response 200**:
```json
{
  "slug": "variables-and-types",
  "title": "Variables & Types",
  "state": "in_progress",
  "achieved_via": null,
  "instructions_html": "<p>In Go, variables...</p>",
  "stub": "package main\n\nfunc main() {\n\t// your code here\n}\n",
  "has_testout": true
}
```

**Side effect**: transitions state from `available` → `in_progress` if currently `available`.

**Errors**: `404 concept_not_found`, `403 concept_locked`

---

### `PATCH /enrollments/:enrollmentId/concepts/:conceptSlug/state`

Manually advance or update concept state. Used by the placement flow to pre-mark concepts `mastered`.

**Request**:
```json
{
  "state": "mastered",
  "achieved_via": "placement"
}
```

**Response 200**: Updated concept state object (same shape as GET /concepts item).

**Errors**: `400 invalid_transition`, `403 concept_locked`

---

## Submissions (Lesson REPL)

### `POST /submissions`

Execute code in the sandbox (run-only, no test suite).

**Request**:
```json
{
  "enrollment_id": "<uuid>",
  "concept_slug": "variables-and-types",
  "submission_type": "run",
  "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"Hello\")\n}\n"
}
```

**Response 202** (submission queued):
```json
{
  "submission_id": "<uuid>",
  "stream_url": "/api/v1/submissions/<uuid>/stream"
}
```

**Errors**: `429 rate_limited` (with `retry_after_seconds` field), `403 not_enrolled`

---

### `GET /submissions/:submissionId/stream`

SSE stream of execution output. Events:

```
event: stdout
data: {"chunk": "Hello\n"}

event: stderr
data: {"chunk": ""}

event: result
data: {"exit_code": 0, "runtime_ms": 142, "memory_bytes": 4096000, "timed_out": false}
```

Stream closes after `result` event. If execution times out (10s wall clock), emits `result` with `timed_out: true`.

---

### `POST /submissions/:submissionId/test`

Run the hidden test suite against the submitted code. Only valid for `run` submissions that have completed.

**Response 202**:
```json
{
  "test_submission_id": "<uuid>",
  "stream_url": "/api/v1/submissions/<uuid>/stream"
}
```

Test result event shape:
```
event: test_result
data: {"name": "TestAddIntegers", "passed": true, "message": ""}

event: result
data: {"passed": true, "exit_code": 0, "runtime_ms": 89, "timed_out": false}
```

If all tests pass, the API automatically transitions concept state to `completed` and creates a `mastery_event` (achieved_via: `lesson`).

---

## Test-Out

### `POST /testout/start`

Open a test-out challenge for a concept. Returns the challenge stub and starts the 4-minute timer server-side.

**Request**:
```json
{
  "enrollment_id": "<uuid>",
  "concept_slug": "variables-and-types"
}
```

**Response 201**:
```json
{
  "challenge_id": "<uuid>",
  "testout_stub": "package main\n\nfunc Solve(input string) string {\n\t// ...\n}\n",
  "expires_at": "<iso8601>",
  "time_remaining_seconds": 240
}
```

**Errors**: `404 no_testout_for_concept`, `409 challenge_already_active`

---

### `POST /testout/:challengeId/submit`

Submit code for test-out evaluation.

**Request**:
```json
{ "code": "..." }
```

**Response 202**:
```json
{
  "submission_id": "<uuid>",
  "stream_url": "/api/v1/submissions/<uuid>/stream"
}
```

If tests pass: concept transitions to `mastered` (achieved_via: `test_out`), mastery_event created.
If tests fail or timer expired: challenge closes, concept opens as `in_progress` (normal lesson), no penalty.

---

## Placement

### `POST /placement/start`

Start the placement challenge flow for an enrollment.

**Request**: `{ "enrollment_id": "<uuid>" }`

**Response 201**:
```json
{
  "placement_id": "<uuid>",
  "tasks": [
    {
      "concept_slug": "variables-and-types",
      "testout_stub": "...",
      "task_number": 1,
      "total_tasks": 6
    }
  ]
}
```

---

### `POST /placement/:placementId/tasks/:taskNumber/submit`

Submit placement task code. Same response shape as `/testout/:id/submit`. Passed tasks immediately mark concept `mastered` (achieved_via: `placement`).

---

### `DELETE /placement/:placementId`

Skip/abandon placement. No concepts are marked mastered. Returns `204 No Content`.

---

## Dashboard

### `GET /users/me/dashboard`

Returns all data for the dashboard view.

**Response 200**:
```json
{
  "stats": {
    "concepts_completed": 3,
    "concepts_total": 10,
    "concepts_tested_out": 2,
    "time_saved_ms": 3600000,
    "capstone_progress_pct": 16
  },
  "continue_building": {
    "current_step": 2,
    "total_steps": 6,
    "step_title": "Data Model & Schema",
    "capstone_session_id": "<uuid>"
  },
  "upcoming_concepts": [
    { "slug": "goroutines", "title": "Goroutines & Channels", "state": "available" },
    { "slug": "interfaces", "title": "Interfaces", "state": "locked" }
  ],
  "other_tracks": [
    { "slug": "rust", "title": "Rust", "status": "coming_soon" }
  ]
}
```

---

## Profile

### `GET /users/me`

**Response 200**:
```json
{
  "display_name": "Andrew",
  "email": "andrew@example.com",
  "role": "learner",
  "join_date": "<iso8601>",
  "streak_count": 7,
  "stats": {
    "concepts_learned": 3,
    "concepts_tested_out": 2,
    "time_saved_ms": 3600000
  }
}
```

---

### `GET /users/me/mastery/:trackSlug`

Returns the per-concept mastery table for the profile view.

**Response 200**:
```json
{
  "track_slug": "go",
  "concepts": [
    {
      "slug": "variables-and-types",
      "title": "Variables & Types",
      "state": "completed",
      "achieved_via": "lesson",
      "runs": 4,
      "best_runtime_ms": 102,
      "mastered_at": "<iso8601>"
    },
    {
      "slug": "functions-and-errors",
      "state": "mastered",
      "achieved_via": "test_out",
      "runs": 0,
      "best_runtime_ms": null,
      "mastered_at": "<iso8601>"
    }
  ]
}
```

---

### `POST /users/me/credentials/:trackSlug`

Generate a shareable credential for a completed track.

**Response 201**:
```json
{
  "credential_url": "https://fluent.dev/credentials/<token>",
  "token": "<opaque_token>",
  "summary": {
    "display_name": "Andrew",
    "track": "Go",
    "completed_at": "<iso8601>",
    "concepts_tested_out": 4,
    "concepts_total": 10
  }
}
```

**Errors**: `403 track_not_completed`

---

## Capstone

### `GET /capstone/:trackSlug`

Returns capstone metadata and the learner's current session state (if any).

**Response 200**:
```json
{
  "track_slug": "go",
  "title": "Build a CRUD REST API",
  "steps": [
    { "number": 1, "title": "Project Setup & Router", "completed": true },
    { "number": 2, "title": "Data Model & Schema", "completed": false, "is_current": true },
    { "number": 3, "title": "HTTP Handlers", "completed": false },
    { "number": 4, "title": "Database Integration", "completed": false },
    { "number": 5, "title": "Middleware & Validation", "completed": false },
    { "number": 6, "title": "Integration Tests", "completed": false }
  ],
  "session": {
    "id": "<uuid>",
    "db_status": "connected",
    "current_step": 2,
    "last_active_at": "<iso8601>"
  }
}
```

---

### `POST /capstone/:trackSlug/sessions`

Provision a new capstone session (or resume an existing one).

**Response 201**:
```json
{
  "session_id": "<uuid>",
  "db_status": "provisioning",
  "poll_url": "/api/v1/capstone/sessions/<uuid>/status"
}
```

---

### `GET /capstone/sessions/:sessionId/status`

Poll session provisioning status.

**Response 200**:
```json
{
  "session_id": "<uuid>",
  "db_status": "connected",
  "expires_at": "<iso8601>"
}
```

`db_status` values: `provisioning`, `connected`, `error`, `expired`

---

### `POST /capstone/sessions/:sessionId/steps/:stepNumber/verify`

Run HTTP verification tests against the learner's running code for the given step.

**Request**:
```json
{ "code_snapshot": "..." }
```

**Response 202**:
```json
{
  "verification_id": "<uuid>",
  "stream_url": "/api/v1/capstone/verifications/<uuid>/stream"
}
```

SSE events:
```
event: http_test
data: {"method": "POST", "path": "/items", "expected_status": 201, "actual_status": 201, "passed": true}

event: result
data: {"passed": true, "step_completed": true, "next_step": 3}
```

If `step_completed: true`, the step is recorded in `capstone_step_completions`.

---

## Observability Endpoints (internal)

### `GET /healthz` — public

Returns `200 OK` with `{"status": "ok"}`. Used by K8s liveness probe.

### `GET /readyz` — public

Returns `200 OK` when database connection pool is healthy, `503` otherwise. Used by K8s readiness probe.

### `GET /metrics` — internal (not exposed publicly)

Prometheus metrics scrape endpoint. Exposes:
- `fluent_sandbox_executions_total` (counter, labels: `type`, `result`)
- `fluent_sandbox_execution_duration_seconds` (histogram, labels: `type`)
- `fluent_capstone_sessions_active` (gauge)
- `fluent_capstone_db_provisioning_duration_seconds` (histogram)
- `fluent_submission_error_rate` (gauge, 5m rolling)
