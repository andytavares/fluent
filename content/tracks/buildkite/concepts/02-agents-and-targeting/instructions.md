## What you build

You write a pipeline that sends each step to the right agent with `agents:` rules. Buildkite only schedules work, so you choose which agent gets each job. This lesson builds on **Pipeline Basics**.

## Key concepts

### Agents register with tags

Every `buildkite-agent` process registers with key/value tags. You set them with `--tags` on the CLI or in the agent's config file, for example `queue=default,docker=true,os=linux`. The tags mean what you decide they mean.

### `queue` is the special tag

An agent with no `queue` tag gets `queue=default`. A step that names no queue can run only on `default`-queue agents.

### `agents:` is a filter on tags

The `agents:` step attribute maps a tag key to a required value. Buildkite sends the job only to an agent that matches every key in the map.

```yaml
steps:
  - label: ":linux: Build (Linux)"
    command: "make build"
    agents:
      queue: "linux"
      os: "linux"
```

This step waits until an agent with both `queue=linux` and `os=linux` connects. Buildkite does not match part of the map, pick another agent or provision one.

### Targeting puts each step on the right machine

Real fleets mix agents: ARM and x86 builders, GPU boxes, Windows agents and a locked-down `deploy` queue. Without `agents:`, Buildkite cannot know that a step needs a GPU or deploy credentials. The first generic agent claims the job. The job then fails, or it runs where it must not have access.

An `agents:` block writes the step's needs into the pipeline. The next person who edits the YAML does not have to know your fleet.

GitHub Actions has an implicit `ubuntu-latest` hosted runner. Buildkite has no hosted default: even Buildkite hosted agents are a queue you target.

### Agent hooks run on the agent, not in the pipeline

Agents can run hooks: shell scripts such as `environment`, `pre-checkout`, `pre-command` and `post-command`. They run around every job on that machine. They live on the agent's filesystem, not in `pipeline.yml`.

Platform teams use hooks for shared setup: registry logins, telemetry and secret retrieval. Hooks are why the same command can act differently on different agents, on purpose.

## Watch out

- Matching is AND, not OR. `queue: "linux"` and `os: "linux"` together need an agent with both tags.
- A step has no "any of" syntax. Use a queue that already means that set of agents.
- A step with no `agents:` block still needs `queue=default`. If no agent is in that queue, the step waits forever.
- Tag values compare as strings. Write `docker: "true"` as the agent sets it, not a YAML boolean.

## The task

Write a pipeline in `stub.yaml` with exactly three command steps, in this order. Each step has its own `agents:` block.

1. Build macOS: `label: ":apple: Build macOS"`, `key: "build-macos"`, `command: "make build"`. Target `queue: "macos"` and `os: "macos"`.
2. Build Linux: `label: ":linux: Build Linux"`, `key: "build-linux"`, `command: "make build"`. Target `queue: "linux"` and `os: "linux"`.
3. Deploy: `label: ":rocket: Deploy"`, `key: "deploy"`, `command: "make deploy"`. Target `queue: "deploy"` and `role: "release"`.

The deploy queue is a locked-down queue with deploy credentials. Quote every value. `command: "make build"` appears exactly twice.

```yaml
steps:
  - label: ":apple: Build macOS"
    key: "build-macos"
    command: "make build"
    agents:
      queue: "macos"
      os: "macos"

  - label: ":linux: Build Linux"
    key: "build-linux"
    command: "make build"
    agents:
      queue: "linux"
      os: "linux"

  - label: ":rocket: Deploy"
    key: "deploy"
    command: "make deploy"
    agents:
      queue: "deploy"
      role: "release"
```
