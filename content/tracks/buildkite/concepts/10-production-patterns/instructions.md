# Production Patterns

## What you'll learn

This concept ties together every prior one — dependencies, env, plugins,
conditionals — into the set of attributes that separate a pipeline that
merely works from one safe to run against production: retry policy,
soft failure, concurrency serialization, cross-pipeline fan-out, and
notifications. Treat this as the checklist you apply before any pipeline
touches a production deploy.

## Key concepts

**`retry.automatic` — recover from transient failures without a human.**
Configure which exit statuses get retried, and how many times:

```yaml
steps:
  - label: ":hammer: Build"
    command: "make build"
    retry:
      automatic:
        - exit_status: "*"
          limit: 2
```

`exit_status: "*"` matches any non-zero exit; scope it to specific codes
(`exit_status: [-1, 255]`, matching lost-agent and OOM-kill signals, is a
common narrower policy) when you don't want to blindly retry genuine
failures. Default limit is 2 if omitted; the maximum is 10.

**`retry.manual` — control whether (and why not) a human can rerun a job.**
Deploy steps are the classic case where you *don't* want a casual retry:

```yaml
steps:
  - label: ":rocket: Deploy"
    command: "make deploy"
    retry:
      manual:
        allowed: false
        reason: "Deploys can't be retried; roll forward instead"
```

**`soft_fail` — let a step fail without failing the build.** For flaky or
non-blocking checks (a nightly benchmark, an experimental linter), scope
which exit codes are allowed to fail softly:

```yaml
steps:
  - label: ":test_tube: Flaky integration tests"
    command: "make test-integration"
    soft_fail:
      - exit_status: 1
```

The build shows the step failed (visually distinct — not hidden), but the
overall build can still pass. This is different from `retry` — soft fail
accepts the failure; retry tries again hoping for a different result.

**`concurrency` + `concurrency_group` — serialize access to a shared
resource.** Deploys to the same environment must never run concurrently,
even from different builds or pipelines:

```yaml
steps:
  - label: ":rocket: Deploy to production"
    command: "make deploy"
    concurrency: 1
    concurrency_group: "myapp/deploy"
```

`concurrency_group` names are global across your organization — reuse a
name deliberately (to share a limit across pipelines targeting the same
resource) and pick a unique, resource-scoped name (`myapp/deploy`, not
`deploy`) everywhere else, or unrelated pipelines will serialize against
each other by accident.

**`trigger` — fan out to another pipeline.** Splits concerns (e.g., a
shared "smoke tests" pipeline triggered by many upstream deploy
pipelines) and lets each pipeline evolve independently:

```yaml
steps:
  - trigger: "downstream-smoke-tests"
    label: ":arrow_forward: Trigger smoke tests"
    build:
      branch: "main"
```

**`notify` — tell people when it matters.** Pipeline-level `notify:`
sends alerts on build events, filterable with the same `if:` conditional
syntax used on steps (build-state conditions like `build.state == "failed"`
are only available at this pipeline level, not per-step):

```yaml
notify:
  - slack:
      channels: ["#deploys"]
    if: build.state == "failed"
```

**`timeout_in_minutes` — bound every job.** A hung job otherwise runs
until someone notices; every production step should declare an explicit
ceiling.

**The production checklist**, applied to every deploy-adjacent step:

- Does it need `retry.automatic` (transient infra) or should retries be
  blocked (`retry.manual: { allowed: false }`) because reruns aren't safe?
- Is failure here allowed to be soft (`soft_fail`), or must it block?
- Does it touch a shared, non-parallelizable resource — add
  `concurrency`/`concurrency_group`.
- Does it need to kick off work in another pipeline — use `trigger`,
  not a copy-pasted step.
- Will the right people find out if it fails — add `notify`.
- Is there a `timeout_in_minutes` so a hang doesn't block the queue
  indefinitely?

## vs other tools

| | Buildkite | GitHub Actions | CircleCI |
|---|---|---|---|
| Automatic retry | `retry.automatic` per exit status | `retry` not native; third-party actions wrap steps | Not native at the job level |
| Non-blocking failure | `soft_fail` (per exit status) | `continue-on-error: true` (job-wide, no exit-status filtering) | N/A |
| Serialize a resource | `concurrency` + `concurrency_group` | `concurrency:` group at workflow/job level | N/A (workflow-level `sequential` execution only) |
| Fan out to another pipeline | `trigger` step | `workflow_call` / `repository_dispatch` | API-triggered pipelines |

Buildkite's `soft_fail` being scoped to specific exit statuses (rather than
GitHub's all-or-nothing `continue-on-error`) is the detail worth
internalizing — it lets you accept a known flaky-test exit code while
still failing hard on an unexpected crash from the same step.

## Watch out

- **`concurrency_group` names are org-wide, not pipeline-scoped** — a
  generic name like `deploy` silently serializes unrelated pipelines
  against each other. Always scope by app/resource: `myapp/deploy`.
- **`block`/`input` steps break concurrency group ordering guarantees** —
  a paused build doesn't enter the concurrency queue until it's unblocked,
  at which point its timestamp is the unblock time, not the original
  queue time.
- **`soft_fail: true` (bare boolean) accepts *any* non-zero exit** — scope
  it with `exit_status:` entries unless you genuinely want every failure
  mode treated as soft.

## The task

Write a `pipeline.yml` with four steps forming a production-hardened
deploy chain:

1. **Build** — `label: ":hammer: Build"`, `key: "build"`,
   `command: "make build"`, `timeout_in_minutes: 10`, and
   `retry.automatic` with one entry: `exit_status: "*"`, `limit: 2`.
2. **Flaky integration tests** — `label: ":test_tube: Flaky integration tests"`,
   `key: "integration-tests"`, `command: "make test-integration"`,
   `depends_on: "build"`, `timeout_in_minutes: 15`, and
   `soft_fail` with one entry: `exit_status: 1`.
3. **Deploy** — `label: ":rocket: Deploy to production"`, `key: "deploy"`,
   `command: "make deploy"`, `depends_on: "build"`,
   `concurrency: 1`, `concurrency_group: "myapp/deploy"`,
   `timeout_in_minutes: 20`, and `retry.manual` with `allowed: false`
   and `reason: "Deploys can't be retried; roll forward instead"`.
4. **Trigger smoke tests** — a trigger step:
   `trigger: "downstream-smoke-tests"`,
   `label: ":arrow_forward: Trigger smoke tests"`, `key: "trigger-smoke"`,
   `depends_on: "deploy"`, `build.branch: "main"`.

Also add a pipeline-level `notify:` that sends a Slack message to
`#deploys` only `if: build.state == "failed"`.

Expected shape:

```yaml
steps:
  - label: ":hammer: Build"
    key: "build"
    command: "make build"
    timeout_in_minutes: 10
    retry:
      automatic:
        - exit_status: "*"
          limit: 2

  - label: ":test_tube: Flaky integration tests"
    key: "integration-tests"
    command: "make test-integration"
    depends_on: "build"
    timeout_in_minutes: 15
    soft_fail:
      - exit_status: 1

  - label: ":rocket: Deploy to production"
    key: "deploy"
    command: "make deploy"
    depends_on: "build"
    concurrency: 1
    concurrency_group: "myapp/deploy"
    timeout_in_minutes: 20
    retry:
      manual:
        allowed: false
        reason: "Deploys can't be retried; roll forward instead"

  - trigger: "downstream-smoke-tests"
    label: ":arrow_forward: Trigger smoke tests"
    key: "trigger-smoke"
    depends_on: "deploy"
    build:
      branch: "main"

notify:
  - slack:
      channels: ["#deploys"]
    if: build.state == "failed"
```
