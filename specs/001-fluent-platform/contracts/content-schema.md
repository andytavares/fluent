# Content Schema: Fluent Exercise Format

**Service**: `content/` (Git-embedded, validated by `tools/content-linter`) | **Date**: 2026-06-19

This document defines the required file structure for tracks, concepts, and the capstone. The CI linter (`tools/content-linter`) validates this schema on every PR and blocks merge on violations (FR-036, FR-037).

---

## Track Directory Layout

```
content/
  tracks/
    {track-slug}/
      config.json          # Required: track-level metadata
      concepts/
        {NNN}-{concept-slug}/   # NNN = zero-padded 2-digit order index
          config.json      # Required: concept-level metadata (no .meta/ subdirectory)
          instructions.md  # Required: learner-facing prose explainer
          stub.{ext}       # Required: starter code (learner receives this)
          exemplar.{ext}   # Required: reference solution (hidden from learners)
          {concept}_test.{ext}  # Required: hidden lesson test suite
          testout_stub.{ext}    # Required if has_testout: true
          testout_test.{ext}    # Required if has_testout: true
  capstone/
    {track-slug}-{capstone-name}/
      config.json          # Required: capstone metadata + step definitions
      step-{N}/            # N = step number (no zero-padding, e.g. step-1, step-2)
        config.json        # Required: step metadata
        verify.sh          # Required: HTTP verification script
        fixtures.sql       # Required: DB seed for this step
```

---

## `tracks/{slug}/config.json`

```json
{
  "slug": "go",
  "title": "Go Fundamentals",
  "description": "Learn Go from first principles — syntax, types, concurrency, and the standard library.",
  "language": "go",
  "status": "published"
}
```

**Rules**:
- `slug` must match the directory name
- `language` is the execution language string passed to the sandbox (e.g. `"go"`, `"python"`, `"rust"`)
- `status` must be `"published"` or `"coming_soon"` — `listTracks` returns all; `listConcepts` and placement only use `published` tracks
- Concept order is determined by the `position` field on each concept's `config.json`, not by an array in this file

---

## `concepts/{NNN}-{slug}/config.json`

```json
{
  "slug": "variables-and-types",
  "title": "Variables & Types",
  "position": 1,
  "has_testout": false,
  "status": "published"
}
```

**Rules**:
- `slug` must match the parent directory name (without the `NNN-` prefix)
- `status` must be `"published"` or `"wip"` — **must always be `"published"` for concepts to appear anywhere in the app** (dashboard, placement, track page all filter `where: { status: "published" }`)
- `position` is a 1-based integer used for ordering; must be unique within a track
- `has_testout`: if `true`, `testout_stub.{ext}` and `testout_test.{ext}` must exist in the directory

---

## `concepts/{slug}/instructions.md`

Required structure (validated by linter):

```markdown
# {Concept Title}

## What you'll learn

[One paragraph: what this concept teaches, framed as "in Go, X works like Y"]

## vs your language

[Comparison callout: how this differs from Python/JavaScript/Java/etc. — the "why this is interesting" hook]

## The task

[What the learner needs to implement. References the stub file.]

## Example

[Optional: a small illustrative snippet showing the pattern in use]
```

---

## `concepts/{slug}/stub.go`

- Must be a valid Go file (`package main`)
- Must compile without the learner's implementation (i.e., stub contains the function signature but returns zero values or panics)
- Must not include the solution
- The linter runs `go build` on the stub to confirm it compiles

---

## `concepts/{slug}/exemplar.go`

- Must be a valid Go file
- Must be a complete, idiomatic implementation of the task
- **Must pass its own test suite** — the linter runs `go test ./...` with the exemplar in place of the stub; PR is blocked if exemplar fails (FR-037)
- Never served to learners; used only by the linter and (optionally) for hints in a future feature

---

## `concepts/{slug}/{concept}_test.go`

- Must be a valid Go test file (`package main` or `package main_test`)
- Must use the standard `testing` package
- Must not import the exemplar directly; tests must be black-box against the public API of the stub
- Must include at least 2 test cases; the linter fails on a single-test file

---

## `concepts/{slug}/testout_stub.go` and `testout_test.go`

Same rules as the lesson stub/tests but:
- The challenge task must be **harder** than the lesson task — the linter does not enforce this but content reviewers must verify it
- `testout_stub.go` must expose a function (not `main`) so the test can call it directly
- The test-out timer is 4 minutes (enforced server-side, not in content)

---

## Capstone: `capstone/{name}/config.json`

```json
{
  "track_slug": "go",
  "title": "Build a CRUD REST API",
  "description": "Assemble a production-grade /items REST API using Go's standard library and a real PostgreSQL database.",
  "total_steps": 6,
  "steps": [
    {
      "number": 1,
      "slug": "project-setup",
      "title": "Project Setup & Router",
      "description": "Initialize the Go module, wire up the HTTP router, and add a health check endpoint.",
      "verification_type": "http",
      "prerequisite_concepts": []
    },
    {
      "number": 2,
      "slug": "data-model",
      "title": "Data Model & Schema",
      "description": "Define the Item struct and run the schema migration against the provisioned database.",
      "verification_type": "http",
      "prerequisite_concepts": ["database-and-sql"]
    }
  ]
}
```

---

## Capstone: `steps/{NN}-{slug}/verify.sh`

The verification script runs inside the same K8s Pod as the learner's server. It makes HTTP requests against `localhost:8080` (the learner's running application) and exits 0 on full pass, 1 on any failure.

Required contract:
- Must output one JSON object per HTTP test to stdout: `{"method": "POST", "path": "/items", "expected_status": 201, "actual_status": 201, "passed": true, "body": "..."}`
- Must exit 0 if all tests pass, 1 otherwise
- Must complete within 30 seconds (capstone runner enforces a 30-second timeout per step verification — SC-005)
- Must not assume any global state beyond what `fixtures.sql` seeds

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:8080"

# Test: POST /items creates a new item
response=$(curl -s -o /tmp/body.txt -w "%{http_code}" -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Widget", "price": 9.99}')
passed=$( [ "$response" -eq 201 ] && echo true || echo false )
echo "{\"method\":\"POST\",\"path\":\"/items\",\"expected_status\":201,\"actual_status\":$response,\"passed\":$passed,\"body\":$(cat /tmp/body.txt | jq -c .)}"

[ "$passed" = "true" ] || exit 1
```

---

## Linter Error Codes

| Code | Description |
|------|-------------|
| `E001` | Missing required file (`instructions.md`, `stub.go`, `exemplar.go`, `{concept}_test.go`) |
| `E002` | `config.json` parse error or missing required field |
| `E003` | `stub.go` does not compile (`go build` failed) |
| `E004` | Exemplar does not pass its own test suite (`go test` failed) |
| `E005` | `has_testout: true` but `testout_stub.go` or `testout_test.go` missing |
| `E006` | Test file has fewer than 2 test cases |
| `E007` | `config.json` references a concept directory that does not exist |
| `E008` | `status: active` concept is missing `blurb` field |
| `W001` | `status: wip` — content is incomplete (warning, not blocking) |
