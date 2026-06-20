# Data Model: Fluent Platform — v1

**Phase**: 1 | **Date**: 2026-06-19 | **Plan**: [plan.md](./plan.md)

All entities derived from `spec.md` § Key Entities. Field types are PostgreSQL. UUIDs use `gen_random_uuid()` as default.

---

## Entity Relationship Overview

```
users
  └─< enrollments >─ tracks
  └─< submissions >─ concepts
  └─< mastery_events >─ concepts
  └─< capstone_sessions >─ enrollments

tracks
  └─< concepts (ordered)
        └─ exercises (1:1 with concept, versioned in content/)

enrollments
  └─< concept_states >─ concepts
  └─ capstone_sessions (0..1 active per enrollment)
        └─< capstone_step_completions
```

---

## Tables

### `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| email | text | UNIQUE NOT NULL | Normalized to lowercase |
| display_name | text | NOT NULL | |
| role | text | NOT NULL DEFAULT 'learner' | Enum: `learner`, `admin` |
| join_date | timestamptz | NOT NULL DEFAULT now() | |
| streak_count | int | NOT NULL DEFAULT 0 | |
| streak_last_active | date | | NULL until first submission |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

---

### `tracks`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| slug | text | UNIQUE NOT NULL | e.g., `go` |
| title | text | NOT NULL | e.g., `Go` |
| description | text | | |
| status | text | NOT NULL DEFAULT 'active' | Enum: `active`, `coming_soon` |
| version | text | NOT NULL | Semver of content manifest, e.g., `1.0.0` |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

---

### `concepts`

Ordered list of teachable units within a track. Static — populated at deploy time from the compiled content manifest.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| track_id | uuid | FK → tracks.id NOT NULL | |
| slug | text | NOT NULL | e.g., `variables-and-types` |
| title | text | NOT NULL | |
| description | text | NOT NULL | One-liner for path view |
| order_index | int | NOT NULL | 1-based; determines unlock sequence |
| has_testout | bool | NOT NULL DEFAULT true | Whether a test-out challenge exists |
| status | text | NOT NULL DEFAULT 'active' | Enum: `active`, `wip`; `wip` hidden from learners |
| UNIQUE | | (track_id, slug) | |
| UNIQUE | | (track_id, order_index) | |

---

### `exercises`

The concrete lesson artifact for a concept. 1:1 with a concept. Content served from the compiled JSON manifest.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| concept_id | uuid | FK → concepts.id UNIQUE NOT NULL | |
| content_ref | text | NOT NULL | Git commit SHA or manifest version that produced this exercise |
| status | text | NOT NULL DEFAULT 'active' | Enum: `active`, `wip` |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

---

### `enrollments`

A learner's active participation in a track.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → users.id NOT NULL | |
| track_id | uuid | FK → tracks.id NOT NULL | |
| placement_completed | bool | NOT NULL DEFAULT false | |
| started_at | timestamptz | NOT NULL DEFAULT now() | |
| completed_at | timestamptz | | NULL until full track completion |
| UNIQUE | | (user_id, track_id) | One enrollment per learner per track |

---

### `concept_states`

State of a single concept for a single learner. One row per (enrollment, concept) pair — created eagerly for all concepts when enrollment is created, starting at `locked` (except the first concept, which starts `available`).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| enrollment_id | uuid | FK → enrollments.id NOT NULL | |
| concept_id | uuid | FK → concepts.id NOT NULL | |
| state | text | NOT NULL DEFAULT 'locked' | Enum: `locked`, `available`, `in_progress`, `mastered`, `completed` |
| achieved_via | text | | Enum: `placement`, `test_out`, `lesson`; NULL while in_progress or locked |
| state_entered_at | timestamptz | NOT NULL DEFAULT now() | Timestamp of last state change |
| UNIQUE | | (enrollment_id, concept_id) | |

**State transition rules** (enforced in `service/` layer, never in handlers):

```
locked       → available      (prerequisite concept reaches mastered or completed)
available    → in_progress    (learner opens the lesson)
available    → mastered       (placement: learner passes placement task for this concept)
in_progress  → mastered       (test_out: learner passes test-out hidden tests)
in_progress  → completed      (lesson: learner passes lesson hidden test suite)
mastered     → mastered       (no-op: cannot un-master)
completed    → completed      (no-op)
```

---

### `submissions`

Immutable record of every code run or test-suite execution.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → users.id NOT NULL | |
| concept_id | uuid | FK → concepts.id NOT NULL | |
| submission_type | text | NOT NULL | Enum: `run`, `test_suite`, `test_out`, `placement` |
| code | text | NOT NULL | Learner's code snapshot |
| stdout | text | | |
| stderr | text | | |
| exit_code | int | | |
| runtime_ms | int | | Wall-clock execution time |
| memory_bytes | bigint | | Peak memory usage |
| passed | bool | | NULL for `run` type (no pass/fail) |
| test_results | jsonb | | `[{name, passed, message}]`; NULL for `run` type |
| timed_out | bool | NOT NULL DEFAULT false | |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**Index**: `(user_id, concept_id, created_at DESC)` for profile mastery table queries.

---

### `mastery_events`

One row per mastery achievement. Drives "time saved by testing out" (FR-032, SC for dashboard/profile).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → users.id NOT NULL | |
| concept_id | uuid | FK → concepts.id NOT NULL | |
| enrollment_id | uuid | FK → enrollments.id NOT NULL | |
| achieved_via | text | NOT NULL | Enum: `placement`, `test_out`, `lesson` |
| achieved_at | timestamptz | NOT NULL DEFAULT now() | |
| lesson_avg_time_ms | int | | Snapshot of the track-wide average lesson completion time at event creation; used to compute "time saved" for `test_out` and `placement` events |
| UNIQUE | | (enrollment_id, concept_id) | One mastery event per concept per enrollment |

**"Time saved" computation**: For each `test_out` or `placement` mastery event, `time_saved_ms = lesson_avg_time_ms`. Aggregate across all such events for a learner's track to get the headline metric. `lesson_avg_time_ms` is populated at event-creation time by querying the p50 of `(test_suite submissions: created_at)` grouped by concept across all learners.

---

### `capstone_sessions`

Active capstone session for a learner. At most one active session per enrollment at a time.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → users.id NOT NULL | |
| enrollment_id | uuid | FK → enrollments.id NOT NULL | |
| current_step | int | NOT NULL DEFAULT 1 | 1-based; matches step config |
| k8s_job_name | text | | Name of the K8s Job; NULL between sessions |
| db_connection_encrypted | text | | AES-256-GCM encrypted connection string; NULL when no active Job |
| db_provisioned_at | timestamptz | | |
| db_expires_at | timestamptz | | provisioned_at + 30min inactivity |
| last_active_at | timestamptz | NOT NULL DEFAULT now() | Updated on every step interaction |
| started_at | timestamptz | NOT NULL DEFAULT now() | |
| completed_at | timestamptz | | NULL until all steps complete |
| UNIQUE | | (enrollment_id) WHERE completed_at IS NULL | One active session per enrollment |

---

### `capstone_step_completions`

Immutable record of completed capstone steps. Persists across session restarts (FR-025).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| session_id | uuid | FK → capstone_sessions.id NOT NULL | |
| step_number | int | NOT NULL | 1-based |
| completed_at | timestamptz | NOT NULL DEFAULT now() | |
| verification_result | jsonb | NOT NULL | `{passed: bool, http_tests: [{method, path, status, passed, response_body}]}` |
| UNIQUE | | (session_id, step_number) | |

---

### `credentials`

Shareable track completion credentials generated by the learner on the profile page (FR-043).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → users.id NOT NULL | |
| track_id | uuid | FK → tracks.id NOT NULL | |
| token | text | UNIQUE NOT NULL | Opaque URL-safe token (32 bytes, base64url) |
| summary | jsonb | NOT NULL | `{name, track_title, completed_at, tested_out_count, concepts_total}` |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

---

## Indexes

```sql
-- Concept state lookups (path view, lesson unlock)
CREATE INDEX idx_concept_states_enrollment ON concept_states(enrollment_id);
CREATE INDEX idx_concept_states_concept ON concept_states(concept_id);

-- Submission history for profile mastery table
CREATE INDEX idx_submissions_user_concept ON submissions(user_id, concept_id, created_at DESC);

-- Mastery events for dashboard stats
CREATE INDEX idx_mastery_events_enrollment ON mastery_events(enrollment_id);

-- Active capstone session lookup
CREATE INDEX idx_capstone_sessions_enrollment ON capstone_sessions(enrollment_id) WHERE completed_at IS NULL;

-- Streak query
CREATE INDEX idx_users_streak ON users(streak_last_active);
```

---

## Content Manifest Schema (JSON, not PostgreSQL)

Compiled at CI time by `tools/content-linter`. Embedded in the API binary.

```json
{
  "version": "1.0.0",
  "tracks": [
    {
      "slug": "go",
      "title": "Go",
      "concepts": [
        {
          "slug": "variables-and-types",
          "title": "Variables & Types",
          "description": "Declare and use variables, constants, and Go's basic type system",
          "order_index": 1,
          "has_testout": true,
          "status": "active",
          "instructions_html": "...",
          "stub": "package main\n\nfunc main() {\n\t// your code here\n}\n",
          "testout_stub": "package main\n\nfunc Solve(input string) string {\n\t// your code here\n}\n"
        }
      ]
    }
  ]
}
```

Note: `exemplar` and test file contents are **never included** in the manifest served to the browser. They are accessed only by the sandbox service at execution time from the server-side filesystem.

---

## Streak Logic

**Definition** (from spec Assumptions): consecutive calendar days with at least one code submission.

**Update procedure** (called in `service/streak.go` after every successful submission):

```
today = current date in user's timezone (UTC for v1)
if streak_last_active == today:
    no-op (already active today)
elif streak_last_active == today - 1 day:
    streak_count += 1
    streak_last_active = today
else:
    streak_count = 1
    streak_last_active = today
```

Timezone handling: UTC for v1 (acknowledged as a planning detail in spec Assumptions §7). A future amendment can add a `users.timezone` field.
