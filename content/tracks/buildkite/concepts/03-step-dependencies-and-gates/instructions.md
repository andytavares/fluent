## What you build

You write a five-step pipeline that orders its steps with `depends_on` and pauses for a person at a `block` step. You use each step's `key` to control order and add human approval. This lesson builds on **Pipeline Basics** and **Agents and Targeting**.

## Key concepts

### Steps run in parallel by default

Buildkite tries to run every step in a build at the same time. Only agent availability limits it. Tools that run jobs in sequence by default work the other way. In Buildkite, you must ask for order.

### A `wait` step is a barrier

Every step above a `wait` must finish and pass before any step below it starts. `wait: ~` (YAML null) is the standalone form.

```yaml
steps:
  - command: "make build"
  - wait: ~
  # runs only after build passes
  - command: "make deploy"
```

By default, a failed step above a `wait` stops all steps after it. Add `continue_on_failure: true` to go past the `wait` after a failure. Use it for cleanup or notify steps that must always run.

```yaml
steps:
  # suppose this fails
  - command: "make test"
  - wait: ~
    continue_on_failure: true
  # still runs
  - command: "./notify-slack.sh"
```

### `depends_on` names the exact steps a step needs

A `wait` gates the whole build. `depends_on` names the keyed steps that one step needs. Steps with no shared dependency then run in parallel, with no `wait` between them.

```yaml
steps:
  - label: "Lint"
    key: "lint"
    command: "make lint"

  - label: "Unit tests"
    key: "unit-tests"
    command: "make test-unit"
    depends_on: "lint"

  # same dependency as unit-tests:
  # both run in parallel after lint
  - label: "Integration tests"
    key: "integration-tests"
    command: "make test-integration"
    depends_on: "lint"
```

`depends_on` takes one key or a list of keys. Any step type can have it: `command`, `block`, `input`, `wait` and `trigger`.

A step with `depends_on` starts as soon as the named steps pass. It does not wait for a `wait` step above it in the YAML, unless `depends_on` names that `wait` step.

This model is close to a build graph, as in Bazel or Nx. Do not put a `wait` between steps that do not depend on each other.

### `block` gates order, and `input` only collects data

Both step types pause the build for a person. They differ in what they do to order:

- `block` depends on the steps around it in the YAML, like a `wait`. A person or an API call must click "Continue".
- `input` collects data with `fields`. It adds no dependency on the steps around it. Use it to gather data, not to gate.

```yaml
steps:
  - block: ":rocket: Deploy to production?"
    key: "deploy-gate"
    prompt: "Confirm before deploying"
    fields:
      - text: "Release name"
        key: "release-name"
    # build shows red while paused
    blocked_state: "failed"
    depends_on:
      - "unit-tests"
      - "integration-tests"

  - label: "Deploy"
    key: "deploy"
    command: "make deploy"
    depends_on: "deploy-gate"
```

### `blocked_state` sets the status while paused

`blocked_state` sets how a paused build shows in external systems, such as a GitHub status check. The values are `passed` (the default), `failed` and `running`. Deploy gates often use `failed`, so a PR that waits for approval does not show green.

## Watch out

- `depends_on` skips `wait` and `block` steps it does not name. Position in the file then has no effect.
- A typo in `depends_on`, such as `"linnt"`, never resolves to a step. Treat keys as an API.
- You can define a `block` step with `fields` only in `pipeline.yml`, not in the web UI form editor.
- A failed step above a `wait` stops the steps below it. Use `continue_on_failure: true` for steps that must always run.

## The task

Write a pipeline in `stub.yaml` with five steps, in this order. They form this graph:

```
lint -> unit-tests, integration-tests
     -> deploy-gate (block) -> deploy
```

1. Lint: `label: ":mag: Lint"`, `key: "lint"`, `command: "make lint"`.
2. Unit Tests: `label: ":test_tube: Unit Tests"`, `key: "unit-tests"`, `command: "make test-unit"`, `depends_on: "lint"`.
3. Integration Tests: `label: ":test_tube: Integration Tests"`, `key: "integration-tests"`, `command: "make test-integration"`, `depends_on: "lint"`.
4. Deploy gate: a `block` step with `block: ":rocket: Deploy to production?"`, `key: "deploy-gate"` and `blocked_state: "failed"`.
5. Deploy: `label: ":shipit: Deploy"`, `key: "deploy"`, `command: "make deploy"`, `depends_on: "deploy-gate"`.

The deploy gate needs both test steps. Write its `depends_on` as a YAML list with one quoted key per line. `depends_on: "lint"` appears exactly twice.

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
