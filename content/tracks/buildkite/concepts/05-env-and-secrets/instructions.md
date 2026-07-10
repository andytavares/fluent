# Env and Secrets

## What you'll learn

Builds on **step dependencies and gates**: your pipeline now has a
meaningful shape. This concept covers the environment every step runs
in — where variables come from, in what order they're layered, and why
`pipeline.yml` (which lives in your source repo, gets logged, and is
visible to anyone who can read the pipeline) is the *wrong* place to put a
secret, no matter how convenient `env:` looks.

## Key concepts

**`env:` at the pipeline level.** A top-level `env:` map applies to every
step in the build:

```yaml
env:
  NODE_ENV: "test"
  APP_NAME: "webapp"

steps:
  - command: "npm test"   # sees NODE_ENV=test, APP_NAME=webapp
```

**`env:` at the step level.** A step's own `env:` map is layered on top —
step-level values win for keys defined at both levels; pipeline-level
values pass through untouched for any key the step doesn't override:

```yaml
steps:
  - label: ":hammer: Build"
    command: "make build"
    env:
      NODE_ENV: "production"   # this step only sees NODE_ENV=production
```

**Precedence, in increasing priority:** agent-level environment (set by
whoever configured the machine) → pipeline-level `env:` → step-level `env:`
→ variables exported by agent hooks that run late in the job lifecycle
(`pre-command`, etc.). When debugging "why is this variable not what I set
in `pipeline.yml`," check step-level `env:` and agent hooks before assuming
the pipeline YAML is wrong.

**`BUILDKITE_*` built-ins.** The agent injects dozens of variables into
every job describing the build itself — no configuration needed:
`BUILDKITE_BRANCH`, `BUILDKITE_COMMIT`, `BUILDKITE_BUILD_NUMBER`,
`BUILDKITE_PIPELINE_SLUG`, `BUILDKITE_MESSAGE`, `BUILDKITE_PULL_REQUEST`.
These are how scripts adapt behavior to the build context without you
threading data through `env:` yourself:

```yaml
steps:
  - command: |
      echo "Building commit $BUILDKITE_COMMIT on branch $BUILDKITE_BRANCH"
```

**Why secrets do not belong in `env:`.** `pipeline.yml` is source code: it's
committed to git history, visible to anyone with repo read access, and
rendered in the Buildkite UI's pipeline settings. An `env:` value is also
echoed into every job's environment and can leak into build logs the moment
a script does `env` or `set -x`. None of that is acceptable for an API
token or database password.

**The right pattern: fetch secrets at runtime, never store them in YAML.**
Buildkite's `secrets:` step attribute references a secret stored in
Buildkite's own secret store (or your existing secrets manager) by name,
injecting it as an environment variable *without* the value ever appearing
in `pipeline.yml`:

```yaml
steps:
  - label: ":closed_lock_with_key: Deploy"
    command: "make deploy"
    secrets:
      - API_ACCESS_TOKEN   # value fetched at job start, never in this file
```

The equivalent, more explicit pattern for teams using an external secrets
manager (Vault, AWS Secrets Manager, etc.) is an agent `pre-command` hook,
or a script step, that fetches the secret and exports it — again, the
*value* never touches `pipeline.yml`, only the *reference* (a secret name
or ARN) does.

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Non-secret config | `env:` (pipeline or step level) | `env:` (workflow, job, or step level) | `variables:` |
| Secrets | `secrets:` step attribute → Buildkite secret store, or external manager fetched at runtime | Encrypted repo/org secrets, injected via `secrets.NAME` | CI/CD variables marked "Protected"/"Masked" |
| Where secret values live | Never in `pipeline.yml` | Never in workflow YAML | Never in `.gitlab-ci.yml` |

The pattern is universal across CI systems for a reason: pipeline
definitions are code, and code is read by more people (and stored in more
places — caches, forks, logs) than a secret should ever reach.

## Watch out

- **A hardcoded value in `env:` is a secret leak the moment it's committed** —
  git history is forever, even after you delete the line in a later commit.
- **`echo $SOME_VAR` in a script prints secrets straight into build logs** —
  build logs are often more widely readable than the pipeline settings
  page. Avoid debugging secrets by printing them, even redacted-looking
  ones (Buildkite's log redaction is best-effort string matching, not a
  guarantee).
- **Step-level `env:` silently shadows pipeline-level `env:` for the same
  key** — if a step behaves unexpectedly, check its own `env:` block before
  assuming the pipeline-level default applies everywhere.

## The task

Write a `pipeline.yml` with a pipeline-level `env:` block and two command
steps, correctly separating non-secret config from a secret reference:

1. Pipeline-level `env:` with `NODE_ENV: "test"` and `APP_NAME: "webapp"`.
2. **Build** — `label: ":hammer: Build"`, `key: "build"`,
   `command: "make build"`, with a step-level `env:` overriding
   `NODE_ENV: "production"` for this step only.
3. **Deploy** — `label: ":closed_lock_with_key: Deploy"`, `key: "deploy"`,
   `command: "make deploy"`, `depends_on: "build"`, and a `secrets:` list
   containing `API_ACCESS_TOKEN` (never a literal value).

Expected shape:

```yaml
env:
  NODE_ENV: "test"
  APP_NAME: "webapp"

steps:
  - label: ":hammer: Build"
    key: "build"
    command: "make build"
    env:
      NODE_ENV: "production"

  - label: ":closed_lock_with_key: Deploy"
    key: "deploy"
    command: "make deploy"
    depends_on: "build"
    secrets:
      - API_ACCESS_TOKEN
```
