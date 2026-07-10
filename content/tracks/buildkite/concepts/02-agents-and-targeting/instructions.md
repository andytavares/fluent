# Agents and Targeting

## What you'll learn

Builds on **pipeline basics**: now that you know Buildkite only schedules
work, you'll learn how it decides *which* of your agents gets a given job —
via tags — and how to write `agents:` targeting rules so the right step
lands on the right machine in a fleet that's rarely uniform.

## Key concepts

**Agent tags.** Every running `buildkite-agent` process registers with a set
of key/value tags — set via `--tags` on the CLI or in its config file, e.g.
`queue=default,docker=true,os=linux`. Tags are arbitrary; you decide what
they mean. One tag is special: **`queue`**. If an agent isn't given an
explicit `queue` tag, it defaults to `queue=default`, and any step that
doesn't specify a queue is only eligible to run on `default`-queue agents.

**The `agents:` step attribute.** This is a map of tag-key → required value.
A job is only dispatched to an agent whose tags satisfy *every* key in the
map:

```yaml
steps:
  - label: ":linux: Build (Linux)"
    command: "make build"
    agents:
      queue: "linux"
      os: "linux"
```

This step will sit queued forever unless some connected agent has both
`queue=linux` and `os=linux` in its tags. Buildkite does not partially
match, substitute, or provision an agent for you — targeting is a filter,
not a request.

**Why targeting matters — mixed fleets.** Real organizations run
heterogeneous agents: ARM and x86 builders, GPU boxes for ML jobs, Windows
agents for a legacy component, a locked-down `deploy` queue with tighter
network/IAM permissions than general-purpose CI agents. Without per-step
targeting, Buildkite has no way to know a step needs a GPU or deploy
credentials — it would just hand the job to whatever generic agent claims
it first, and the job would fail (or worse, run somewhere it shouldn't have
access). Explicit `agents:` blocks are how you encode "this step's
requirements" directly in the pipeline, instead of hoping whoever edits the
YAML next remembers your fleet's topology.

**Agent hooks (concept, not syntax).** Agents also support *hooks* —
shell scripts (`environment`, `pre-checkout`, `pre-command`,
`post-command`, etc.) that run automatically around every job on that
machine, defined on the agent's filesystem, not in `pipeline.yml`. They're
how platform teams inject shared setup (registry logins, telemetry, secret
retrieval) without every pipeline author having to repeat it. You won't
write hooks in `pipeline.yml` — just know they exist, live on the agent
side, and are why "the same command works differently on different agents"
is sometimes intentional infrastructure, not a bug.

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Targeting mechanism | Free-form tags matched via `agents:` map | `runs-on:` labels on GitHub-hosted or self-hosted runners | `tags:` on jobs matched to runner tags |
| Default target | `queue=default` if untagged | `ubuntu-latest` (hosted) unless overridden | Any runner with no tags, depending on project config |
| Provisioning on mismatch | None — job queues indefinitely | Hosted runners auto-provision; self-hosted must exist | None — job stays pending |

The shape is similar across all three: tags are a filter, not a
provisioning request. Buildkite's difference is that *nothing* is
hosted by default (even "Buildkite hosted agents" are an explicit opt-in
queue you target) — there's no implicit `ubuntu-latest` fallback.

## Watch out

- **Matching is AND, not OR.** `agents: { queue: "linux", os: "linux" }`
  requires both tags. There's no built-in "any of" syntax at the step
  level — you'd need a queue that already encodes that meaning.
- **A step with no `agents:` block is not "runs anywhere."** It still
  requires `queue=default` — if all your real agents are tagged into
  specific queues and none carry the `default` queue, that step queues
  forever.
- **Tag values are strings for comparison purposes**, even when they read
  like booleans — write `docker: "true"`, matching how the agent was
  started, not a YAML boolean.

## The task

Write a `pipeline.yml` with exactly three command steps, in this order,
each with its own `agents:` targeting block:

1. **Build macOS** — `label: ":apple: Build macOS"`, `key: "build-macos"`,
   `command: "make build"`, targeted at `queue: "macos"` and `os: "macos"`.
2. **Build Linux** — `label: ":linux: Build Linux"`, `key: "build-linux"`,
   `command: "make build"`, targeted at `queue: "linux"` and `os: "linux"`.
3. **Deploy** — `label: ":rocket: Deploy"`, `key: "deploy"`,
   `command: "make deploy"`, targeted at `queue: "deploy"` and
   `role: "release"` (a locked-down queue with deploy credentials).

Expected shape:

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
