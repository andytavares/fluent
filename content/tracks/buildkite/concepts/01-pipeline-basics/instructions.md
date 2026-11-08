## What you build

You write a Buildkite pipeline with three command steps: lint, test and build. You learn the `steps` array and the attributes every command step needs.

## Key concepts

### Buildkite schedules jobs, and your agents run them

Buildkite has two halves that never share a disk. The hosted control plane reads `.buildkite/pipeline.yml` and creates a build: a graph of jobs. It does not run your code.

The `buildkite-agent` binary runs your code. It is a small Go process on your own VM, container or Kubernetes cluster. It polls Buildkite, claims a job it can run, checks out your repo and runs the command. Results stream back over the API.

```
push -> control plane -> build (jobs)
agent polls -> claims job -> runs it
agent -> results -> control plane
```

Three results of this split:

- Your source code and secrets stay on hardware you control.
- Nothing runs until an agent is online. With zero agents, the build waits for an agent and never starts.
- Any machine can be an agent: GPU boxes, macOS, mainframes, air-gapped networks. Buildkite only schedules. It never provisions.

GitHub Actions and CircleCI hide this split behind hosted runners. Buildkite makes you own the agents.

### A pipeline is a `steps` array

A `pipeline.yml` has one required top-level key: `steps`. Each entry is a step. The most common is a command step, which runs a shell command on an agent.

```yaml
steps:
  - command: "make test"
```

### `commands` runs a list in one job

`command` takes one shell command. `commands` takes a YAML list. The commands run in order, in one job, on one agent, in one working directory. If one command fails, Buildkite skips the rest and the step fails.

```yaml
steps:
  - label: ":test_tube: Test"
    commands:
      - "make deps"
      - "make test"
```

Separate steps can run on different agents, in different working directories. To move files between steps, you use artifacts, a later concept.

### `label` is only for people

`label` is the text on the build page. It has no effect on how the step runs. Buildkite shows `:name:` emoji shortcodes, for example `:hammer:`, `:test_tube:` and `:package:`. `name` is an alias for `label`.

### `key` identifies a step

`key` is a unique, stable ID for a step. Other steps use it in `depends_on`, the next concept. `buildkite-agent step get` uses it to read a step's result. A key cannot look like a UUID.

Do not change a key after other steps use it. Use short, kebab-case names such as `lint` and `unit-tests`. Do not copy the label into the key, because labels change often.

## Watch out

- A `commands` list runs in one job on one agent. Separate steps can land on different agents.
- `label` is not an ID. Two steps can have the same label. Only `key` must be unique.
- A colon in an unquoted YAML value can break the parse. Quote labels and commands that contain `:`.
- A build that waits for an agent is not a YAML error. No agent is online to claim the job.

## The task

Write a Buildkite pipeline in `stub.yaml`. It has a top-level `steps` key and exactly three command steps, in this order:

1. Lint: `label: ":mag: Lint"`, `key: "lint"`, `command: "make lint"`.
2. Test: `label: ":test_tube: Test"`, `key: "test"`. Use a `commands:` list that runs `"make deps"`, then `"make test"`.
3. Build: `label: ":package: Build"`, `key: "build"`, `command: "make build"`.

Quote every value. The file contains exactly three `label:` lines.

```yaml
steps:
  - label: ":mag: Lint"
    key: "lint"
    command: "make lint"

  - label: ":test_tube: Test"
    key: "test"
    commands:
      - "make deps"
      - "make test"

  - label: ":package: Build"
    key: "build"
    command: "make build"
```
