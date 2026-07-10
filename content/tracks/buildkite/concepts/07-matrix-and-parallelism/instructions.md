# Matrix and Parallelism

## What you'll learn

Builds on **conditionals** and **agents and targeting**: you can already
target one step at one kind of agent. This concept covers Buildkite's two
mechanisms for turning *one step definition* into *many jobs* —
`matrix` and `parallelism` — which solve different problems and are not
interchangeable.

## Key concepts

**`matrix` — different inputs, same command shape.** A matrix expands one
step template across a list (or lists) of values, substituting
`{{matrix}}` into `label`, `command`/`commands`, `env`, `plugins`, and
`agents`:

```yaml
steps:
  - label: ":test_tube: Test {{matrix}}"
    command: "make test LANG_VERSION={{matrix}}"
    matrix:
      - "3.9"
      - "3.10"
      - "3.11"
```

This produces three jobs, one per Python version, each with its own
`{{matrix}}` substitution. Use a single-dimension matrix any time the
*only* thing changing between jobs is one value.

**Multi-dimension matrices with `matrix.setup`.** For more than one varying
axis, use `setup` with named dimensions — Buildkite creates the full
cross-product:

```yaml
steps:
  - label: ":test_tube: {{matrix.os}} / {{matrix.arch}}"
    command: "echo {{matrix.os}} {{matrix.arch}}"
    matrix:
      setup:
        os:
          - "linux"
          - "windows"
        arch:
          - "amd64"
          - "arm64"
```

Two dimensions of two values each produce four jobs (`2 × 2`). Reference
each dimension as `{{matrix.<dimension-name>}}`.

**`adjustments` — patch individual matrix cells.** With `matrix.setup`, an
`adjustments` list can `skip` a specific combination entirely, or mark it
`soft_fail` (allowed to fail without breaking the build) — useful for a
known-broken or low-priority combination you still want visibility into
without blocking the pipeline:

```yaml
    matrix:
      setup:
        os: ["linux", "windows"]
        arch: ["amd64", "arm64"]
      adjustments:
        - with:
            os: "windows"
            arch: "arm64"
          skip: true
```

**`parallelism` — same input, split the work.** `parallelism: N` creates
`N` identical jobs from one step — same command, same environment — for
splitting a single, large workload (typically a test suite) across
workers. Each job gets `BUILDKITE_PARALLEL_JOB` (its 0-based index) and
`BUILDKITE_PARALLEL_JOB_COUNT` (the total), which your test runner or a
splitting script uses to partition work:

```yaml
steps:
  - label: ":test_tube: Sharded tests"
    command: "make test-shard"   # reads BUILDKITE_PARALLEL_JOB internally
    parallelism: 4
```

**Matrix vs. parallelism — different problems.** A matrix answers "run
this against N *different inputs*" (versions, OSes, architectures) —each
job is meaningfully different. `parallelism` answers "split this *one*
workload across N identical workers" for speed — each job is identical
except for which shard of data/tests it picks up. They are **not
compatible on the same step** — you cannot combine `matrix:` and
`parallelism:` in one step definition, but you can use both in the same
build on separate steps.

## vs other tools

| | Buildkite | GitHub Actions | CircleCI |
|---|---|---|---|
| Different inputs | `matrix:` (array or `setup` + `adjustments`) | `strategy.matrix:` | N/A (no native matrix; parameterized configs) |
| Splitting one workload | `parallelism:` + `BUILDKITE_PARALLEL_JOB` | `strategy.matrix` reused as a splitter, or third-party test-splitting actions | `parallelism:` + `CIRCLE_NODE_INDEX` |
| Excluding a combination | `matrix.adjustments` with `skip`/`soft_fail` | `strategy.matrix.exclude` | N/A |

GitHub Actions overloads its single `matrix` mechanism for both "different
inputs" and "split one workload" use cases; Buildkite keeps them as two
distinct, purpose-built attributes, which is why matrix and parallelism
can't be combined on one step — they're solving different problems by
design, not by omission.

## Watch out

- **Matrix values can't be used in `key` or `concurrency_group`** — only
  `env`, `label`, `commands`, `plugins`, and `agents` accept `{{matrix}}`
  interpolation. If you need a unique key per matrix job, you don't get
  one automatically.
- **`parallelism` jobs don't split anything for you** — Buildkite creates
  N identical jobs; *your test runner* (or a wrapper script) must read
  `BUILDKITE_PARALLEL_JOB` / `BUILDKITE_PARALLEL_JOB_COUNT` and decide
  which subset of tests to run. Forgetting this means N jobs all running
  the entire suite.
- **`adjustments` requires `matrix.setup`** — you can't add `adjustments`
  to a bare list-form matrix; switch to the `setup` form first.

## The task

Write a `pipeline.yml` with three command steps:

1. **Language version matrix** — `label: ":test_tube: Test {{matrix}}"`,
   `key: "test-matrix"`, `command: "make test LANG_VERSION={{matrix}}"`,
   with a single-dimension `matrix:` list of `"3.9"`, `"3.10"`, `"3.11"`.
2. **OS/arch matrix with an adjustment** — `label: ":test_tube: {{matrix.os}} / {{matrix.arch}}"`,
   `key: "test-matrix-multi"`, `command: "echo {{matrix.os}} {{matrix.arch}}"`,
   using `matrix.setup` with `os: ["linux", "windows"]` and
   `arch: ["amd64", "arm64"]`, and an `adjustments` entry that skips the
   `windows`/`arm64` combination (`skip: true`).
3. **Sharded tests** — `label: ":test_tube: Sharded tests"`,
   `key: "test-shards"`, `command: "make test-shard"`, `parallelism: 4`
   (on its own step, never combined with `matrix:`).

Expected shape:

```yaml
steps:
  - label: ":test_tube: Test {{matrix}}"
    key: "test-matrix"
    command: "make test LANG_VERSION={{matrix}}"
    matrix:
      - "3.9"
      - "3.10"
      - "3.11"

  - label: ":test_tube: {{matrix.os}} / {{matrix.arch}}"
    key: "test-matrix-multi"
    command: "echo {{matrix.os}} {{matrix.arch}}"
    matrix:
      setup:
        os:
          - "linux"
          - "windows"
        arch:
          - "amd64"
          - "arm64"
      adjustments:
        - with:
            os: "windows"
            arch: "arm64"
          skip: true

  - label: ":test_tube: Sharded tests"
    key: "test-shards"
    command: "make test-shard"
    parallelism: 4
```
