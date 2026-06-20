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
          .meta/
            config.json    # Required: concept-level metadata
          instructions.md  # Required: learner-facing prose explainer
          stub.go          # Required: starter code (learner receives this)
          exemplar.go      # Required: reference solution (hidden from learners)
          {concept}_test.go  # Required: hidden lesson test suite
          testout_stub.go  # Required if has_testout: true
          testout_test.go  # Required if has_testout: true
  capstone/
    {track-slug}-{capstone-name}/
      config.json          # Required: capstone metadata + step definitions
      steps/
        {NN}-{step-slug}/  # NN = zero-padded 2-digit step number
          instructions.md  # Required
          stub/            # Required: starting code scaffold for this step
            main.go
            go.mod
          verify.sh        # Required: HTTP verification script (runs against learner's server)
          fixtures.sql     # Required: DB seed for this step
```

---

## `tracks/{slug}/config.json`

```json
{
  "slug": "go",
  "title": "Go",
  "description": "Build a production CRUD API in Go from scratch.",
  "version": "1.0.0",
  "status": "active",
  "concepts": [
    "01-variables-and-types",
    "02-functions-and-errors",
    "03-structs-and-methods",
    "04-interfaces",
    "05-goroutines-and-channels",
    "06-context",
    "07-testing",
    "08-http-and-routing",
    "09-database-and-sql",
    "10-error-handling-patterns"
  ]
}
```

**Rules**:
- `slug` must match the directory name
- `version` must be a valid semver string
- `status` must be `active` or `coming_soon`
- `concepts` must be an ordered array of directory names that exist under `concepts/`
- Adding a new concept requires adding it to this array at the correct position

---

## `concepts/{NNN}-{slug}/.meta/config.json`

```json
{
  "slug": "variables-and-types",
  "title": "Variables & Types",
  "description": "Declare and use variables, constants, and Go's basic type system",
  "blurb": "vs your language: Go is statically typed with inference — no `var` ceremony required",
  "status": "active",
  "has_testout": true,
  "difficulty": "introductory"
}
```

**Rules**:
- `slug` must match the parent directory name (without the `NNN-` prefix)
- `status` must be `active` or `wip`
- `wip` exercises are hidden from learners but may be merged (FR-038)
- `has_testout` must be `true` or `false`; if `true`, `testout_stub.go` and `testout_test.go` must exist
- `difficulty` must be one of: `introductory`, `easy`, `medium`, `hard`

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
