## What you build

You write a four-step deploy chain with retry policy, soft failure, a concurrency limit, a trigger and a failure notification. These attributes make a working pipeline safe to run against production. This lesson builds on **Step Dependencies and Gates**, **Env and Secrets**, **Conditionals** and **Plugins**.

## Key concepts

### `retry.automatic` recovers from transient failures

`retry.automatic` sets which exit statuses Buildkite retries, and how many times.

```yaml
steps:
  - label: ":hammer: Build"
    command: "make build"
    retry:
      automatic:
        - exit_status: "*"
          limit: 2
```

`exit_status: "*"` matches any non-zero exit. To avoid a retry of real failures, list specific codes. A common narrow policy is `exit_status: [-1, 255]`: a lost agent and a forced agent shutdown. With no `limit`, the default is 2. The maximum is 10.

### `retry.manual` controls if a person can rerun a job

A deploy step is the classic case where you do not want a casual retry.

```yaml
steps:
  - label: ":rocket: Deploy"
    command: "make deploy"
    retry:
      manual:
        allowed: false
        reason: "Roll forward instead"
```

### `soft_fail` lets a step fail without failing the build

Use `soft_fail` for flaky or non-blocking checks, such as a nightly benchmark or an experimental linter. List the exit codes that can fail softly.

```yaml
steps:
  - label: ":test_tube: Integration tests"
    command: "make test-integration"
    soft_fail:
      - exit_status: 1
```

The build page shows the step as failed, but the build can still pass. `soft_fail` accepts the failure. `retry` tries again for a different result.

GitHub Actions has `continue-on-error`, which applies to all exit codes. Buildkite's per-exit-status `soft_fail` accepts a known flaky exit code and still fails hard on a crash.

### `concurrency` and `concurrency_group` serialize a shared resource

Two deploys to the same environment must never run at the same time, even from different builds or pipelines.

```yaml
steps:
  - label: ":rocket: Deploy to production"
    command: "make deploy"
    concurrency: 1
    concurrency_group: "myapp/deploy"
```

`concurrency_group` names are global across your organization. Reuse a name on purpose, to share a limit across pipelines for one resource. Everywhere else, use a unique name scoped to the resource, such as `myapp/deploy`.

### `trigger` starts a build of another pipeline

A trigger step splits concerns. For example, many deploy pipelines can trigger one shared smoke-test pipeline. Each pipeline then changes on its own.

```yaml
steps:
  - trigger: "downstream-smoke-tests"
    label: ":arrow_forward: Smoke tests"
    build:
      branch: "main"
```

### `notify` alerts people on build events

Pipeline-level `notify:` sends alerts on build events. It filters with the same `if:` syntax as steps. Build-state conditions such as `build.state == "failed"` work only at this pipeline level, not per step.

```yaml
notify:
  - slack:
      channels: ["#deploys"]
    if: build.state == "failed"
```

### `timeout_in_minutes` limits every job

Without a timeout, a hung job runs until someone notices. Give every production step an explicit limit.

### Check every deploy step against this list

- Does it need `retry.automatic` for transient infrastructure failures?
- Or must you block reruns with `retry.manual: { allowed: false }`, because a rerun is not safe?
- Can this failure be soft (`soft_fail`), or must it block?
- Does it touch a shared resource that cannot run in parallel? Add `concurrency` and `concurrency_group`.
- Does it start work in another pipeline? Use `trigger`, not a copied step.
- Do the right people learn about a failure? Add `notify`.
- Does it have `timeout_in_minutes`, so a hang does not block the queue?

## Watch out

- `concurrency_group` names are org-wide. A generic name such as `deploy` serializes unrelated pipelines. Scope it: `myapp/deploy`.
- A build paused at a `block` or `input` step enters the concurrency queue only when unblocked.
- Its queue position then uses the unblock time, not the original time. This breaks the group's order.
- `soft_fail: true` accepts any non-zero exit. Scope it with `exit_status:` entries.

## The task

Write a pipeline in `stub.yaml` with four steps and a pipeline-level `notify:`. Together they form a hardened deploy chain. Step labels are free text: the checks do not read them, so a label can differ from the stub's comment.

1. Build: `label: ":hammer: Build"`, `key: "build"`, `command: "make build"`, `timeout_in_minutes: 10`.
2. Give Build a `retry.automatic` list with one entry: `exit_status: "*"`, `limit: 2`.
3. Integration tests: `label: ":test_tube: Integration tests"`, `key: "integration-tests"`, `command: "make test-integration"`.
4. Give Integration tests `depends_on: "build"`, `timeout_in_minutes: 15` and a `soft_fail` list with one entry: `exit_status: 1`.
5. Deploy: `label: ":rocket: Deploy to production"`, `key: "deploy"`, `command: "make deploy"`, `depends_on: "build"`.
6. Give Deploy `concurrency: 1`, `concurrency_group: "myapp/deploy"` and `timeout_in_minutes: 20`.
7. Give Deploy a `retry.manual` with `allowed: false` and a quoted `reason`.
8. Trigger: `trigger: "downstream-smoke-tests"`, `label: ":arrow_forward: Smoke tests"`, `key: "trigger-smoke"`, `depends_on: "deploy"`.
9. Give the trigger step a `build:` map with `branch: "main"`.
10. Add a top-level `notify:` that sends a Slack message to `#deploys` only `if: build.state == "failed"`.

`depends_on: "build"` appears exactly twice.

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

  - label: ":test_tube: Integration tests"
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
        reason: "Roll forward instead"

  - trigger: "downstream-smoke-tests"
    label: ":arrow_forward: Smoke tests"
    key: "trigger-smoke"
    depends_on: "deploy"
    build:
      branch: "main"

notify:
  - slack:
      channels: ["#deploys"]
    if: build.state == "failed"
```
