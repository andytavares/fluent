## What you build

You write a pipeline that sets non-secret config with `env:` and gets a secret with `secrets:`. You learn where variables come from and in what order they apply. This lesson builds on **Step Dependencies and Gates**.

## Key concepts

### Pipeline-level `env:` applies to every step

A top-level `env:` map sets variables for every step in the build.

```yaml
env:
  NODE_ENV: "test"
  APP_NAME: "webapp"

steps:
  # sees NODE_ENV=test, APP_NAME=webapp
  - command: "npm test"
```

### Step-level `env:` wins over pipeline-level `env:`

A step's own `env:` map applies on top of the pipeline map. For a key in both maps, the step value wins. Keys that the step does not set keep their pipeline values.

```yaml
steps:
  - label: ":hammer: Build"
    command: "make build"
    env:
      # this step sees NODE_ENV=production
      NODE_ENV: "production"
```

### Variables apply in a fixed order

From lowest to highest priority:

1. The agent-level environment, set by the person who configured the machine.
2. Pipeline-level `env:`.
3. Step-level `env:`.
4. Variables that agent hooks export late in the job, such as `pre-command`.

If a variable is not what `pipeline.yml` sets, check step-level `env:` and agent hooks first.

### The agent sets `BUILDKITE_*` variables

The agent adds many variables about the build to every job, with no configuration. Examples: `BUILDKITE_BRANCH`, `BUILDKITE_COMMIT`, `BUILDKITE_BUILD_NUMBER`, `BUILDKITE_PIPELINE_SLUG`, `BUILDKITE_MESSAGE` and `BUILDKITE_PULL_REQUEST`. Scripts read them to adapt to the build, and you do not pass that data through `env:`.

```yaml
steps:
  - command: |
      echo "Commit: $BUILDKITE_COMMIT"
      echo "Branch: $BUILDKITE_BRANCH"
```

### Secrets do not belong in `env:`

`pipeline.yml` is source code. Git history keeps it, anyone with repo read access sees it, and the Buildkite UI shows it in pipeline settings. An `env:` value goes into every job's environment. It leaks into build logs when a script runs `env` or `set -x`.

### `secrets:` gets a secret at job start

The `secrets:` step attribute names a secret in Buildkite's secret store or your secrets manager. The agent sets it as an environment variable. The value never appears in `pipeline.yml`.

```yaml
steps:
  - label: ":closed_lock_with_key: Deploy"
    command: "make deploy"
    secrets:
      # fetched at job start
      - API_ACCESS_TOKEN
```

With an external secrets manager, such as Vault or AWS Secrets Manager, use an agent `pre-command` hook or a script step. It fetches the secret and exports it. Only the reference, a secret name or ARN, is in `pipeline.yml`.

GitHub Actions and GitLab CI follow the same rule: secret values never go in the pipeline YAML.

## Watch out

- A secret value in `env:` leaks when you commit it. Git history keeps it after you delete the line.
- `echo $SOME_VAR` prints a secret into the build log. More people can often read logs than pipeline settings.
- Do not print secrets to debug them. Buildkite's log redaction is best-effort string matching, not a guarantee.
- Step-level `env:` hides pipeline-level `env:` for the same key. Check the step's own `env:` block first.

## The task

Write a pipeline in `stub.yaml`. Keep non-secret config in `env:` and refer to the secret by name only.

1. Add a pipeline-level `env:` block with `NODE_ENV: "test"` and `APP_NAME: "webapp"`.
2. Build: `label: ":hammer: Build"`, `key: "build"`, `command: "make build"`.
3. Give Build a step-level `env:` that sets `NODE_ENV: "production"` for this step only.
4. Deploy: `label: ":closed_lock_with_key: Deploy"`, `key: "deploy"`, `command: "make deploy"`, `depends_on: "build"`.
5. Give Deploy a `secrets:` list with one entry: `API_ACCESS_TOKEN`, unquoted.

Never write a value for `API_ACCESS_TOKEN`. A line such as `API_ACCESS_TOKEN: "..."` fails the task.

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
