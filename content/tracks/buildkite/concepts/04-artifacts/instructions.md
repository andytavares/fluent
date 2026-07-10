# Artifacts

## What you'll learn

Builds on **step dependencies and gates**: a `depends_on` chain controls
*when* steps run, but says nothing about *files* moving between them. Two
steps in a Buildkite build are not guaranteed to share a machine — each job
can land on a different agent. Artifacts are how you move build output
(binaries, coverage reports, logs) from the agent that produced it to the
agent that needs it next.

## Key concepts

**Every job gets its own checkout.** Because steps may run on entirely
different agents, anything an earlier step's shell wrote to disk (a
compiled binary, a `node_modules` folder, a test report) is invisible to a
later step unless you explicitly ship it through Buildkite's artifact
storage.

**`artifact_paths` — upload declaratively.** Attach this to a command step
to have the agent upload matching files *after* the step's command
finishes, whether it passed or failed:

```yaml
steps:
  - label: ":hammer: Build"
    key: "build"
    command: "make build"
    artifact_paths:
      - "dist/**/*"
```

The value is one or more [glob patterns](https://buildkite.com/docs/pipelines/configure/glob-pattern-syntax)
(`**` for recursive directories), as a single semicolon-separated string or
a YAML list. `artifact_paths` only *uploads* — it never downloads.

**`buildkite-agent artifact upload` / `download` — do it yourself, mid-command.**
For finer control (uploading before the step ends, or downloading a
specific file from a specific earlier step), call the agent binary directly
from your `command`/`commands`:

```yaml
steps:
  - label: ":test_tube: Test"
    key: "test"
    depends_on: "build"
    commands:
      - "buildkite-agent artifact download 'dist/**/*' ."
      - "make test"
```

By default, `artifact download` fetches the most recent matching artifact
from *anywhere in the current build* — you don't need to know which step
or agent produced it. Pass `--step <key>` to pin it to a specific step if
more than one step could have produced a same-named file.

**Cross-step artifact flow.** Chain `artifact_paths` (upload) on the
producing step with `buildkite-agent artifact download` (fetch) on the
consuming step's command. This is the standard build → test → package
shape: build compiles once and uploads the output; every downstream step
(test, package, deploy) downloads it rather than rebuilding.

**Retention thinking.** Artifacts aren't free or infinite — they're stored
per build under your organization's retention policy and count toward
storage usage. Treat `artifact_paths` globs deliberately: upload the
compiled output and test reports you actually need downstream or for
debugging, not entire working directories (`node_modules/`, `.git/`) which
bloat storage and slow every subsequent upload/download.

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Declare in step | `artifact_paths:` glob(s) | `actions/upload-artifact` step | `artifacts: paths:` |
| Fetch in a later job | `buildkite-agent artifact download` (or auto via same job) | `actions/download-artifact` step | Automatic within same pipeline (`dependencies:`) |
| Cross-pipeline access | REST API, or same-cluster rules | `actions/download-artifact` with `run-id` | `needs:` with `artifacts: true`, or API |

Buildkite's model is more "pull it yourself, by glob, whenever you need it"
than GitHub Actions' explicit named-artifact upload/download step pair —
there's no separate "artifact name" concept; you address artifacts by the
path they were uploaded from.

## Watch out

- **`artifact_paths` uploads after the command finishes** — if your command
  crashes before producing the file, there's nothing to upload; the step's
  exit status is unaffected by a failed artifact upload (it's best-effort).
- **`artifact download` defaults to "most recent anywhere in the build"** —
  in a matrix or parallel build where multiple steps produce a same-named
  file, pin the source explicitly with `--step`.
- **Downloaded artifacts land relative to the job's working directory** —
  the destination argument to `download` is a directory, and glob downloads
  preserve the uploaded path structure underneath it.

## The task

Write a `pipeline.yml` with three command steps forming a build → test →
package chain that moves a compiled artifact between them:

1. **Build** — `label: ":hammer: Build"`, `key: "build"`,
   `command: "make build"`, `artifact_paths: ["dist/**/*"]`.
2. **Test** — `label: ":test_tube: Test"`, `key: "test"`,
   `depends_on: "build"`, using `commands:` to first run
   `"buildkite-agent artifact download 'dist/**/*' ."` then `"make test"`.
3. **Package** — `label: ":package: Package"`, `key: "package"`,
   `depends_on: "test"`, using `commands:` to first run
   `"buildkite-agent artifact download 'dist/**/*' ."` then `"make package"`,
   and `artifact_paths: ["release/*.tar.gz"]`.

Expected shape:

```yaml
steps:
  - label: ":hammer: Build"
    key: "build"
    command: "make build"
    artifact_paths:
      - "dist/**/*"

  - label: ":test_tube: Test"
    key: "test"
    depends_on: "build"
    commands:
      - "buildkite-agent artifact download 'dist/**/*' ."
      - "make test"

  - label: ":package: Package"
    key: "package"
    depends_on: "test"
    commands:
      - "buildkite-agent artifact download 'dist/**/*' ."
      - "make package"
    artifact_paths:
      - "release/*.tar.gz"
```
