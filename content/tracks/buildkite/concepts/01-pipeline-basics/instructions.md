# Pipeline Basics

## What you'll learn

Buildkite splits into two halves that never touch each other's disk: a hosted
**control plane** that schedules work, and **your own agents** that actually
run it. Every other concept in this track — targeting, secrets, dynamic
pipelines — falls out of that split. You'll also learn the core unit of a
Buildkite pipeline: the `steps` array, and the handful of attributes every
command step needs.

## Key concepts

**Control plane vs. your agents.** When you push code, Buildkite's SaaS
service reads `.buildkite/pipeline.yml` (or a pipeline defined in its UI) and
creates a *build* — a graph of *jobs* waiting to run. It does **not** run any
of your code. Instead, the `buildkite-agent` binary — a small Go process you
install on your own VM, container, or Kubernetes cluster — polls Buildkite,
claims a job it's eligible for, checks out your repo, and executes the step's
command. Results stream back over the API.

This matters immediately:

- Your source code and secrets never enter Buildkite's infrastructure — they
  stay on hardware you control.
- Nothing runs until an agent is online to claim it. A pipeline with zero
  connected agents queues forever; it doesn't run "in the cloud" like GitHub
  Actions' hosted runners do by default.
- You can run wildly different environments (GPU boxes, macOS, mainframes)
  as agents, because Buildkite only ever schedules — it never provisions.

**The `steps` array.** A `pipeline.yml` is a YAML document with one required
top-level key: `steps`. Each entry is a step — most commonly a *command
step*, which runs a shell command on an agent:

```yaml
steps:
  - command: "make test"
```

**`command` vs `commands`.** `command` takes one shell command (or a `|`
block of several piped as one string). `commands` takes a YAML list — each
entry runs in sequence, in the same job, on the same agent, in the same
working directory. If any command in the list fails, the rest are skipped
and the step fails:

```yaml
steps:
  - label: ":test_tube: Test"
    commands:
      - "make deps"
      - "make test"
```

Don't confuse this with separate *steps* — those aren't guaranteed to share
a machine (or even a working directory) unless you move data between them
with artifacts (a later concept).

**`label` and emoji.** `label` is what renders in the Buildkite build page —
unlike `command`, it's just cosmetic. Buildkite renders `:name:` emoji
shortcodes (the same set GitHub and Slack use), so pipelines are scannable
at a glance: `:hammer:`, `:test_tube:`, `:rocket:`, `:package:`, `:shipit:`.
`name` is an accepted alias for `label`.

**`key`.** A unique, stable identifier for a step. Unlike `label`, `key`
must never change once other steps reference it — it's how you build
dependency graphs (`depends_on`, covered next concept) and how a step's
result is looked up later (`buildkite-agent step get`). Keys can't look like
a UUID. Prefer short, kebab-case, purpose-named keys (`lint`, `unit-tests`)
over labels-as-keys — labels are free text meant for humans and change
often.

## vs other tools

| | Buildkite | GitHub Actions | CircleCI |
|---|---|---|---|
| Executes your code | Your own agent (self-hosted or Buildkite-hosted) | GitHub-hosted runner by default | CircleCI-hosted executor by default |
| Pipeline definition location | `.buildkite/pipeline.yml` in-repo, or pipeline settings UI | `.github/workflows/*.yml` in-repo | `.circleci/config.yml` in-repo |
| What the control plane stores | Build/job metadata only — never your source | Workflow run metadata | Build metadata |
| Step ordering primitive | Steps array, `wait`, `depends_on` | `jobs` + `needs` | `jobs` + `requires` |

The practical consequence: a Buildkite pipeline can sit idle showing
"waiting for available agent" even though your YAML is perfectly valid —
that's not a bug, it's the architecture. GitHub Actions and CircleCI hide
this distinction behind hosted runners; Buildkite makes you own it (and, in
return, lets you run agents anywhere: air-gapped networks, GPU fleets,
on-prem hardware).

## Watch out

- **`commands` (plural) is not the same as multiple `command` steps.** A
  `commands` list runs sequentially in *one* job on *one* agent. Separate
  steps may land on different agents entirely.
- **`label` is not an identifier.** Two steps can have the identical label;
  Buildkite doesn't care. Only `key` needs to be unique.
- **YAML makes `:` a hazard in emoji-free labels containing colons** —
  always quote labels and commands that contain `:` or start with special
  YAML characters.

## The task

Write a `pipeline.yml` with exactly three command steps, in this order:

1. **Lint** — `label: ":mag: Lint"`, `key: "lint"`, `command: "make lint"`.
2. **Test** — `label: ":test_tube: Test"`, `key: "test"`, using the plural
   `commands:` list form to run, in order: `"make deps"` then `"make test"`.
3. **Build** — `label: ":package: Build"`, `key: "build"`, `command: "make build"`.

Expected shape:

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
