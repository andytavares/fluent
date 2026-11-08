## What you build

You write four steps that each use a different condition: branch, tag, pull-request state and commit message. A condition decides if a step is in the build at all, with no script. This lesson builds on **Step Dependencies and Gates**.

## Key concepts

### `if:` decides if a step is in the build

Every step type accepts `if:`, a boolean expression. If it is false, Buildkite leaves the step out of the build. The step shows as "broken", not "skipped": its own configuration excluded it.

```yaml
steps:
  - label: ":test_tube: Tests"
    command: "./scripts/tests.sh"
    if: build.message !~ /skip tests/
```

### Buildkite evaluates `if:` once, at upload

The condition runs when you upload the pipeline. It does not run again at step runtime, and it cannot see other steps' results. You cannot write `if: some-step.outcome == "passed"`. For that, use a dynamic pipeline upload after the earlier step, a later concept.

GitHub Actions and GitLab CI also evaluate conditions before any job runs.

### The expression language reads the build context

The language is C-like. Variables include `build.branch`, `build.tag`, `build.message`, `build.commit` and `pipeline.slug`. Pull-request fields include `build.pull_request.id`, `build.pull_request.draft` and `build.pull_request.base_branch`.

Operators: `==`, `!=`, `=~` (regex match), `!~` (regex non-match), `&&`, `||` and `!`.

```yaml
steps:
  - label: ":rocket: Deploy to production"
    command: "make deploy ENV=production"
    if: build.tag != null

  - label: ":test_tube: Extended tests"
    command: "make test-extended"
    if: |
      build.pull_request.id == null &&
      build.branch == 'main'
```

### Quote the expression or use a `|` block

YAML gives special meaning to many characters in these expressions, such as `!`, `:` and quotes. Quote the whole expression as a string. For a long condition, use the `|` block form, which needs no quotes.

```yaml
steps:
  - if: |
      build.message !~ /skip tests/ &&
      build.branch =~ /^feature\//
```

### `branches:` is the simple branch filter

`branches:` is the older mechanism. It takes a space-separated string of branch patterns. It is simpler than the same `if: build.branch =~ ...` expression.

```yaml
steps:
  - label: ":rocket: Deploy to staging"
    command: "make deploy ENV=staging"
    branches: "main"
```

You cannot use `branches:` and `if:` on the same step. Use `branches:` for a simple branch allow-list. Use `if:` for tags, PR state, the commit message, or combinations that `branches:` cannot express.

| Need | Use |
|---|---|
| Only on `main` or `release/*` | `branches:` |
| Only on tagged builds | `if: build.tag != null` |
| Skip on a commit message | `if: build.message !~ /skip ci/` |
| Only outside pull requests | `if: build.pull_request.id == null` |
| Several of the above | `if:` with `&&` or `\|\|` |

## Watch out

- A step cannot have both `if:` and `branches:`. Use one mechanism per step.
- `if:` cannot see other steps' outcomes. Use `depends_on` or a dynamic pipeline upload for "only if that step passed".
- An unquoted expression that starts with `!` can parse as a YAML tag. Write `if: "!build.pull_request.draft"`.

## The task

Write a pipeline in `stub.yaml` with four command steps. Each step uses a different condition.

1. Deploy to staging: `label: ":rocket: Deploy to staging"`, `key: "deploy-staging"`, `command: "make deploy ENV=staging"`, `branches: "main"`.
2. Deploy to production: `label: ":shipit: Deploy to production"`, `key: "deploy-production"`, `command: "make deploy ENV=production"`, `if: build.tag != null`.
3. Extended tests: `label: ":test_tube: Extended tests"`, `key: "extended-tests"`, `command: "make test-extended"`.
4. Give Extended tests the condition `"build.pull_request.id == null && build.branch == 'main'"` on one line.
5. Lint: `label: ":mag: Lint"`, `key: "lint"`, `command: "make lint"`, `if: build.message !~ /skip ci/`.

Write the production and lint conditions unquoted, as shown.

```yaml
steps:
  - label: ":rocket: Deploy to staging"
    key: "deploy-staging"
    command: "make deploy ENV=staging"
    branches: "main"

  - label: ":shipit: Deploy to production"
    key: "deploy-production"
    command: "make deploy ENV=production"
    if: build.tag != null

  - label: ":test_tube: Extended tests"
    key: "extended-tests"
    command: "make test-extended"
    if: "build.pull_request.id == null && build.branch == 'main'"

  - label: ":mag: Lint"
    key: "lint"
    command: "make lint"
    if: build.message !~ /skip ci/
```
