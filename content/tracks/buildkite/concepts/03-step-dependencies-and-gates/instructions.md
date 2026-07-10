# Step Dependencies and Gates

## What you'll learn

Builds on **pipeline basics** and **agents and targeting**: you now know
`key` uniquely names a step. This concept is about what you do with that
key — controlling *order* and inserting *human approval* into a pipeline,
instead of relying on Buildkite's default (parallel-everything) scheduling.

## Key concepts

**Default scheduling: everything runs at once.** Unless told otherwise,
Buildkite tries to run every step in a build simultaneously, subject only to
agent availability. This surprises people coming from tools that default to
sequential jobs. You must opt in to ordering.

**Implicit ordering with `wait`.** A `wait` step is a barrier: every step
above it must finish (and pass) before any step below it starts.

```yaml
steps:
  - command: "make build"
  - wait: ~
  - command: "make deploy"   # only runs after build passes
```

`wait: ~` (YAML null) is the standalone form. By default a failed step
*upstream* of a `wait` halts everything after it — add
`continue_on_failure: true` to let the pipeline proceed past the wait even
if something earlier failed (useful for "always run cleanup/notify steps"):

```yaml
steps:
  - command: "make test"      # suppose this fails
  - wait: ~
    continue_on_failure: true
  - command: "./notify-slack.sh"   # still runs
```

**Explicit ordering with `depends_on` + `key`.** `wait` is coarse — it's an
all-or-nothing gate across the *entire* build. `depends_on` lets a step name
exactly which keyed step(s) it needs, which unlocks fine-grained DAGs:
steps with no shared dependency run in parallel automatically, without a
`wait` between them.

```yaml
steps:
  - label: "Lint"
    key: "lint"
    command: "make lint"

  - label: "Unit tests"
    key: "unit-tests"
    command: "make test-unit"
    depends_on: "lint"

  - label: "Integration tests"
    key: "integration-tests"
    command: "make test-integration"
    depends_on: "lint"          # same dependency as unit-tests
                                 # → these two run in PARALLEL after lint
```

`depends_on` accepts a single key, a list of keys, and can be attached to
any step type (`command`, `block`, `input`, `wait`, `trigger`). A step with
an explicit `depends_on` runs as soon as its named dependencies pass — it
does **not** implicitly wait on any `wait` step positioned before it in the
YAML, unless that `wait` step is itself named in `depends_on`.

**`block` vs `input` — manual gates.** Both pause the build for a human.
The difference is *what* they imply about ordering:

- **`block`** creates *implicit* dependencies on the steps immediately
  around it in the YAML — like a `wait`, but requiring a person (or API
  call) to click "Continue" instead of just steps passing.
- **`input`** collects data (via `fields`) *without* implying any ordering
  dependency on surrounding steps — use it purely to gather information,
  not to gate.

```yaml
steps:
  - block: ":rocket: Deploy to production?"
    key: "deploy-gate"
    prompt: "Confirm before deploying"
    fields:
      - text: "Release name"
        key: "release-name"
    blocked_state: "failed"       # build shows red while paused, not green
    depends_on:
      - "unit-tests"
      - "integration-tests"

  - label: "Deploy"
    key: "deploy"
    command: "make deploy"
    depends_on: "deploy-gate"
```

`blocked_state` controls how the paused build appears in external systems
(like a GitHub status check) while waiting — `passed` (default), `failed`,
or `running`. Setting it to `failed` is common for deploy gates so a
paused-for-approval PR doesn't show as green in GitHub.

## vs other tools

| | Buildkite | GitHub Actions | Jenkins |
|---|---|---|---|
| Default step order | Parallel unless declared otherwise | Sequential within a job unless matrix'd | Sequential unless parallel stages used |
| Ordering primitive | `wait` (coarse) / `depends_on`+`key` (fine DAG) | `needs:` between jobs | `stage`/`parallel` blocks |
| Manual approval | `block` / `input` step types, in-pipeline | `environment` protection rules, external to the YAML | `input` step (Pipeline DSL) |

Buildkite's `depends_on` DAG model is closer to a build graph (like Bazel or
Nx) than to the flat sequential-stage model many CI tools default to — take
advantage of it: steps with no shared dependency should simply not declare
one, rather than being artificially serialized behind a `wait`.

## Watch out

- **`depends_on` bypasses `wait`/`block` unless explicitly named.** If a
  step has `depends_on: "lint"` and there's an unrelated `wait` step above
  it in the YAML, that step does not wait for the `wait` step — only for
  `lint`. This trips people who assume position in the file matters once
  `depends_on` is present.
- **A missing `key` on a dependency target is a silent typo risk** —
  `depends_on: "linnt"` (typo) simply never resolves to a step; treat key
  names as an API, not a label.
- **`block` steps requiring `fields` can only be defined in `pipeline.yml`**,
  not through the web UI form editor.

## The task

Write a `pipeline.yml` with five steps, in this order, forming this DAG:
`lint` → (`unit-tests`, `integration-tests` in parallel) → `deploy-gate`
(block) → `deploy`.

1. **Lint** — `label: ":mag: Lint"`, `key: "lint"`, `command: "make lint"`.
2. **Unit Tests** — `label: ":test_tube: Unit Tests"`, `key: "unit-tests"`,
   `command: "make test-unit"`, `depends_on: "lint"`.
3. **Integration Tests** — `label: ":test_tube: Integration Tests"`,
   `key: "integration-tests"`, `command: "make test-integration"`,
   `depends_on: "lint"`.
4. **Deploy gate** — a `block` step: `block: ":rocket: Deploy to production?"`,
   `key: "deploy-gate"`, `blocked_state: "failed"`,
   `depends_on: ["unit-tests", "integration-tests"]` (a list — it needs both).
5. **Deploy** — `label: ":shipit: Deploy"`, `key: "deploy"`,
   `command: "make deploy"`, `depends_on: "deploy-gate"`.

Expected shape:

```yaml
steps:
  - label: ":mag: Lint"
    key: "lint"
    command: "make lint"

  - label: ":test_tube: Unit Tests"
    key: "unit-tests"
    command: "make test-unit"
    depends_on: "lint"

  - label: ":test_tube: Integration Tests"
    key: "integration-tests"
    command: "make test-integration"
    depends_on: "lint"

  - block: ":rocket: Deploy to production?"
    key: "deploy-gate"
    blocked_state: "failed"
    depends_on:
      - "unit-tests"
      - "integration-tests"

  - label: ":shipit: Deploy"
    key: "deploy"
    command: "make deploy"
    depends_on: "deploy-gate"
```
