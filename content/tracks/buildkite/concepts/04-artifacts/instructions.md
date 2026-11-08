## What you build

You write a build, test and package chain that moves a compiled artifact between steps. `depends_on` controls when steps run, but it moves no files. This lesson builds on **Step Dependencies and Gates**.

## Key concepts

### Every job gets its own checkout

Each job can land on a different agent. A later step cannot see what an earlier step wrote to disk: a compiled binary, a `node_modules` folder or a test report. To move a file, you send it through Buildkite's artifact storage.

### `artifact_paths` uploads files after the command

Add `artifact_paths` to a command step. The agent uploads the matching files after the command finishes, if it passed or failed.

```yaml
steps:
  - label: ":hammer: Build"
    key: "build"
    command: "make build"
    artifact_paths:
      - "dist/**/*"
```

The value is one or more [glob patterns](https://buildkite.com/docs/pipelines/configure/glob-pattern-syntax). `**` matches directories recursively. Write the globs as one semicolon-separated string or as a YAML list. `artifact_paths` only uploads. It never downloads.

### The agent CLI uploads and downloads inside a command

Call `buildkite-agent artifact upload` or `download` from your `command` or `commands`. Use it to upload before the step ends, or to download a file from one earlier step.

```
buildkite-agent artifact download \
  'dist/**/*' .
```

By default, `artifact download` gets the most recent matching artifact from anywhere in the current build. You do not need to know which step or agent made it. Pass `--step <key>` to pin the source when more than one step can make a file with that name.

### Upload once, download in each later step

Put `artifact_paths` on the step that makes the file. Put `buildkite-agent artifact download` in the command of each step that uses it. Build compiles once and uploads the output. Test, package and deploy download it and do not rebuild.

GitHub Actions uses named artifacts in an upload and download step pair. Buildkite has no artifact name: you address an artifact by the path you uploaded it from.

### Artifacts cost storage

Buildkite stores artifacts per build, under your organization's retention policy. They count toward storage usage. Upload the compiled output and test reports you need later. Do not upload whole working directories such as `node_modules/` or `.git/`. They fill storage and slow every upload and download.

## Watch out

- `artifact_paths` uploads after the command finishes. If the command crashes before it makes the file, nothing uploads.
- A failed artifact upload does not change the step's exit status. The upload is best-effort.
- `artifact download` gets the most recent match in the build. In a matrix or parallel build, pin the source with `--step`.
- The `download` destination is a directory, relative to the job's working directory. Glob downloads keep the uploaded path structure under it.

## The task

Write a pipeline in `stub.yaml` with three command steps, in this order. Build makes `dist/`, and test and package download it.

1. Build: `label: ":hammer: Build"`, `key: "build"`, `command: "make build"`. Its `artifact_paths` list has one entry: `"dist/**/*"`.
2. Test: `label: ":test_tube: Test"`, `key: "test"`, `depends_on: "build"`. Its `commands:` list runs the download command, then `"make test"`.
3. Package: `label: ":package: Package"`, `key: "package"`, `depends_on: "test"`. Its `commands:` list runs the download command, then `"make package"`.
4. Package also has an `artifact_paths` list with one entry: `"release/*.tar.gz"`.

The download command is `"buildkite-agent artifact download 'dist/**/*' ."`. Write it on one line, exactly twice.

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
