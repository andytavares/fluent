# Dynamic Pipelines

## What you'll learn

Builds on **conditionals**: `if:` can only decide, at upload time, whether
a *known* step runs. Dynamic pipelines answer a different question — "what
steps should exist at all?" — computed by a script, at build time. This is
Buildkite's superpower over static-YAML-only CI systems, and the mechanism
every advanced pattern in this track (monorepos, per-step-outcome
branching, generated matrices) ultimately relies on.

## Key concepts

**`buildkite-agent pipeline upload` — inject new steps into the running
build.** Any command step can run a script that prints YAML (or JSON) to
stdout and pipes it into this command. The uploaded steps are inserted into
the *same build*, immediately after the uploading step, and scheduled like
any other step — different generated steps can still land on different
agents:

```yaml
steps:
  - label: ":pipeline: Generate pipeline"
    command: ".buildkite/generate-pipeline.sh | buildkite-agent pipeline upload"
```

**The bootstrap-to-generate pattern.** The most common shape: your
committed `pipeline.yml` contains *only* this one step. Everything else is
computed by a script, in any language that can print YAML to stdout
(Bash, Python, Ruby, Go — whatever your team already uses):

```bash
#!/bin/bash
set -euo pipefail
echo "steps:"
for test_dir in tests/*/; do
  suite=$(basename "$test_dir")
  cat <<YAML
  - label: ":test_tube: Test ${suite}"
    command: "make test SUITE=${suite}"
    agents:
      queue: "default"
YAML
done
```

Add a new `tests/<suite>/` directory and the next build picks it up with
zero `pipeline.yml` changes — the pipeline definition tracks your
repository's actual structure instead of drifting from it.

**Conditional step injection at runtime.** Because the generator is a real
script, it can make decisions `if:` cannot — like branching on another
step's *result*, which static `if:` expressions are structurally
forbidden from doing (they're evaluated at upload time, before any step
runs):

```bash
if [ "$(buildkite-agent step get "outcome" --step "validation-check")" = "passed" ]; then
  cat <<YAML | buildkite-agent pipeline upload
steps:
  - label: "Run regression suite"
    command: ./scripts/regression_tests.sh
YAML
fi
```

**Monorepo diff-based pipelines.** In a monorepo, a generator script can
inspect which files changed (`git diff` against the target branch, or the
`if_changed` step attribute for the simple single-service case) and emit
steps only for the affected services — instead of running every service's
full pipeline on every commit:

```bash
if git diff --name-only "$BUILDKITE_COMMIT" origin/main | grep -q '^services/api/'; then
  cat <<YAML | buildkite-agent pipeline upload
steps:
  - label: ":test_tube: Test api service"
    command: "make -C services/api test"
YAML
fi
```

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Generate steps at runtime | `buildkite-agent pipeline upload` from any script | Not natively — requires a separate workflow-dispatch trick or reusable workflows with static inputs | `dynamic child pipelines` via a generated `.gitlab-ci.yml` artifact + `trigger: include:` |
| Language for generation | Any language producing YAML/JSON | N/A | Any language producing YAML |
| Injected into the current build | Yes — same build, immediately | N/A | Yes, as a child pipeline |

GitLab's dynamic child pipelines are the closest analog — both treat "the
pipeline is a program's output" as a first-class pattern. GitHub Actions
has no equivalent primitive; teams simulate it with matrix strategies
computed by an earlier job, which is far more constrained than arbitrary
generated YAML.

## Watch out

- **Environment variable interpolation happens at upload time, on the
  agent, before generated steps run.** `$FOO` in generated YAML is
  substituted immediately by the uploading agent; escape it (`$$FOO`) or
  pass `--no-interpolation` if you need the *step's own* `env:` to resolve
  it later instead.
- **Multiple uploads from one step insert in reverse order** by default —
  if a single script calls `pipeline upload` more than once, don't assume
  the first call's steps appear first; use `depends_on` if order matters.
- **This is not a substitute for `if:`.** If a step's exclusion depends
  only on static build metadata (branch, tag, message), a plain `if:`
  expression is simpler and doesn't require a script; reach for dynamic
  generation when the decision needs a live git diff, another step's
  outcome, or external state.

## The task

Write a `pipeline.yml` implementing the bootstrap-to-generate pattern, with
one real step and a commented example of the YAML a generator script would
emit:

1. A single command step: `label: ":pipeline: Generate pipeline"`,
   `key: "generate"`, `command: ".buildkite/generate-pipeline.sh | buildkite-agent pipeline upload"`.
2. Below it, as YAML comments (each line starting with `#`), include an
   example of the pipeline the generator script produces at runtime: a
   `# steps:` block with a test step and a conditional deploy step guarded
   by `if: build.branch == "main"`.

Expected shape:

```yaml
steps:
  - label: ":pipeline: Generate pipeline"
    key: "generate"
    command: ".buildkite/generate-pipeline.sh | buildkite-agent pipeline upload"

# --- Example: generate-pipeline.sh emits YAML like this at runtime ---
# steps:
#   - label: ":test_tube: Test unit"
#     command: "make test SUITE=unit"
#   - label: ":rocket: Deploy"
#     command: "make deploy"
#     if: build.branch == "main"
```
