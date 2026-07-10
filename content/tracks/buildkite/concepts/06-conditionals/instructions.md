# Conditionals

## What you'll learn

Builds on **step dependencies and gates**: you can already control *order*.
Now control *whether a step exists in the build at all*, based on branch,
tag, commit message, or pull-request state — without writing a script to
decide it for you (that's a later concept, dynamic pipelines).

## Key concepts

**`if:` — a boolean expression, evaluated at upload time.** Every step type
accepts `if:`. If the expression evaluates `false`, the step is omitted
from the build entirely (it shows as "broken," not "skipped" — a distinct
state meaning the step's own configuration excluded it).

```yaml
steps:
  - label: ":test_tube: Tests"
    command: "./scripts/tests.sh"
    if: build.message !~ /skip tests/
```

Conditions are evaluated once, when the pipeline is uploaded — **not** at
step runtime, and not re-evaluated based on other steps' results. You
cannot write `if: some-step.outcome == "passed"` directly; that requires a
dynamic pipeline upload gated on the earlier step's result (see the
**dynamic pipelines** concept).

**Available variables.** The expression language is C-like and covers the
build context: `build.branch`, `build.tag`, `build.message`,
`build.commit`, `pipeline.slug`, and pull-request-specific fields like
`build.pull_request.id`, `build.pull_request.draft`,
`build.pull_request.base_branch`. Operators include `==`, `!=`, `=~`
(regex match), `!~` (regex non-match), `&&`, `||`, `!`.

```yaml
steps:
  - label: ":rocket: Deploy to production"
    command: "make deploy ENV=production"
    if: build.tag != null

  - label: ":test_tube: Extended tests"
    command: "make test-extended"
    if: "build.pull_request.id == null && build.branch == 'main'"
```

**Quoting matters.** YAML gives special meaning to many characters used in
these expressions (`!`, `:`, quotes). Quote the whole expression as a
string to avoid YAML misparsing it, or use the `|` block form for
multi-line conditions (which sidesteps quoting entirely):

```yaml
steps:
  - if: |
      build.message !~ /skip tests/ &&
      build.branch =~ /^feature\//
```

**`branches:` — the simpler, older mechanism.** For the common case of
"only run on these branches," `branches:` takes a space-separated pattern
string and is simpler than an equivalent `if: build.branch =~ ...`
expression:

```yaml
steps:
  - label: ":rocket: Deploy to staging"
    command: "make deploy ENV=staging"
    branches: "main"
```

You cannot combine `branches:` and `if:` on the same step — pick one.
`branches:` fits simple branch allow-lists; reach for `if:` when the
condition involves tags, PR state, commit message, or boolean combinations
`branches:` can't express.

**When each mechanism fits:**

| Need | Use |
|---|---|
| Step only runs on `main` / `release/*` | `branches:` |
| Step only runs on tagged builds | `if: build.tag != null` |
| Step skipped when commit message says so | `if: build.message !~ /skip ci/` |
| Step only runs outside pull requests | `if: build.pull_request.id == null` |
| Combining several of the above | `if:` with `&&` / `||` |

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Step-level condition | `if:` expression language | `if:` (GitHub Actions expression syntax, `${{ }}`) | `rules:` with `if:` (CI/CD variable expressions) |
| Branch-only shortcut | `branches:` pattern string | `on: push: branches:` (workflow-level, not step-level) | `rules: - if: $CI_COMMIT_BRANCH == "main"` |
| Evaluated when | Pipeline upload time | Workflow trigger time | Pipeline creation time |

All three evaluate conditions before any job runs, not mid-build — this is
a common surprise across CI systems, not unique to Buildkite: none of them
let you branch on "did the previous step pass" via a static conditional;
that always requires either job dependency graphs or a dynamic
generation step.

## Watch out

- **`if:` and `branches:` are mutually exclusive on the same step** —
  Buildkite rejects (or silently prioritizes one over the other,
  depending on version) a step defining both; use one mechanism per step.
- **Conditions can't see other steps' outcomes** — `if:` is evaluated at
  upload time, before any job runs. "Run this step only if that step
  passed" is a `depends_on` relationship (steps still run, but skip
  internally) or a dynamic pipeline upload, not an `if:` expression.
- **Unquoted expressions starting with `!` are the most common YAML
  footgun here** — `if: !build.pull_request.draft` without quotes can be
  misparsed as a YAML tag. Quote it: `if: "!build.pull_request.draft"`.

## The task

Write a `pipeline.yml` with four command steps, each demonstrating a
different conditional mechanism:

1. **Deploy to staging** — `label: ":rocket: Deploy to staging"`,
   `key: "deploy-staging"`, `command: "make deploy ENV=staging"`,
   `branches: "main"`.
2. **Deploy to production** — `label: ":shipit: Deploy to production"`,
   `key: "deploy-production"`, `command: "make deploy ENV=production"`,
   `if: build.tag != null`.
3. **Extended tests** — `label: ":test_tube: Extended tests"`,
   `key: "extended-tests"`, `command: "make test-extended"`,
   `if: "build.pull_request.id == null && build.branch == 'main'"`.
4. **Lint (skippable)** — `label: ":mag: Lint"`, `key: "lint"`,
   `command: "make lint"`, `if: build.message !~ /skip ci/`.

Expected shape:

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
