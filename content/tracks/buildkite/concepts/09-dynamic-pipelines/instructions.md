## What you build

You write a bootstrap pipeline with one step that runs a generator script, plus a commented example of what the script prints. `if:` decides at upload if a known step runs. A dynamic pipeline decides which steps exist at all, with a script at build time. This lesson builds on **Conditionals**.

## Key concepts

### `buildkite-agent pipeline upload` adds steps to the running build

Any command step can run a script that prints YAML or JSON to stdout and pipes it into this command. Buildkite inserts the uploaded steps into the same build, right after the uploading step. It schedules them like any other step, so they can land on different agents.

```yaml
steps:
  - label: ":pipeline: Generate pipeline"
    command: >-
      .buildkite/generate-pipeline.sh |
      buildkite-agent pipeline upload
```

The `>-` folds the two lines into one command string. Monorepos, branching on a step's outcome and generated matrices all depend on this mechanism.

### The bootstrap step generates everything else

In the most common shape, your committed `pipeline.yml` has only this one step. A script computes all other steps. Use any language that can print YAML to stdout: Bash, Python, Ruby or Go.

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

Add a new `tests/<suite>/` directory, and the next build runs it with no `pipeline.yml` change. The pipeline follows the repository's real structure and does not drift from it.

### A generator can branch on another step's result

The generator is a real script, so it can decide what `if:` cannot. `if:` runs at upload, before any step runs, so it cannot read another step's result. A script can.

```bash
outcome=$(buildkite-agent step get \
  "outcome" --step "validation-check")
if [ "$outcome" = "passed" ]; then
  buildkite-agent pipeline upload <<YAML
steps:
  - label: "Run regression suite"
    command: ./scripts/regression_tests.sh
YAML
fi
```

### A monorepo generator tests only changed services

In a monorepo, a generator can check which files changed with `git diff` against the target branch. It then adds steps only for the affected services. For one service, the `if_changed` step attribute is simpler.

```bash
changed=$(git diff --name-only \
  "$BUILDKITE_COMMIT" origin/main)
if echo "$changed" |
  grep -q '^services/api/'; then
  buildkite-agent pipeline upload <<YAML
steps:
  - label: ":test_tube: Test api service"
    command: "make -C services/api test"
YAML
fi
```

GitLab's dynamic child pipelines are the closest match. GitHub Actions has no equal: teams use a matrix computed by an earlier job, which is much more limited.

## Watch out

- The uploading agent replaces `$FOO` in generated YAML at upload time. Write `$$FOO` to let the step resolve it later.
- `--no-interpolation` also turns off upload-time replacement for the whole upload.
- Several uploads from one step insert in reverse order by default. Use `depends_on` if order matters.
- Do not use a generator where `if:` works. Branch, tag and message conditions need no script.
- Use a generator when the decision needs a live git diff, another step's outcome or external state.

## The task

Write a bootstrap pipeline in `stub.yaml`. It has one real step and a commented example of the generator's output.

1. Add one command step: `label: ":pipeline: Generate pipeline"`, `key: "generate"`.
2. Its command runs `.buildkite/generate-pipeline.sh` and pipes the output to `buildkite-agent pipeline upload`.
3. Below the step, add YAML comments that show the generated pipeline. Start each comment line with `#`.
4. The comment has a `# steps:` line, a `":test_tube: Test unit"` step and a `":rocket: Deploy"` step.
5. Guard the deploy step with `if: build.branch == "main"`.

```yaml
steps:
  - label: ":pipeline: Generate pipeline"
    key: "generate"
    command: >-
      .buildkite/generate-pipeline.sh |
      buildkite-agent pipeline upload

# Example output of generate-pipeline.sh:
# steps:
#   - label: ":test_tube: Test unit"
#     command: "make test SUITE=unit"
#   - label: ":rocket: Deploy"
#     command: "make deploy"
#     if: build.branch == "main"
```
