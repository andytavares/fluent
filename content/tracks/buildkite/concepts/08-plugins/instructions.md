# Plugins

## What you'll learn

Builds on **step dependencies and gates** and **conditionals**: you can
shape *when* steps run. Plugins shape *how* a step's job executes — most
commonly, running the command inside a container instead of directly on
the agent's host. This is the standard way Buildkite pipelines get
Docker-based, reproducible builds without hand-rolling `docker run` in
every `command`.

## Key concepts

**Plugin YAML shape.** The `plugins:` attribute on a command step is a
list. Each entry's key is `<plugin-name>#<version>` and its value is that
plugin's configuration map:

```yaml
steps:
  - command: "yarn install && yarn test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"
```

A plugin with no configuration is written with `~` (YAML null) as its
value: `- library-example#v1.0.0: ~`. Multiple plugins on one step run in
the order they're listed, per lifecycle hook (checkout, command, etc.).

**The `docker` plugin — the workhorse for single-container jobs.** Runs
the step's `command` inside a container built from `image`, instead of on
the bare agent host:

```yaml
steps:
  - label: ":docker: Build and test"
    command: "npm install && npm test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"
```

**The `docker-compose` plugin — multi-service jobs.** For anything needing
more than one container (app + database + cache), the `docker-compose`
plugin drives a `docker-compose.yml` in your repo. It also supports
building an image in one step and referencing it (via the build's
meta-data store) from a later step, without rebuilding:

```yaml
steps:
  - label: ":docker: Build and push image"
    plugins:
      - docker-compose#v5.11.0:
          build: "app"
          image-repository: "index.docker.io/myorg/myapp"

  - wait

  - label: ":docker: Run tests against built image"
    command: "test.sh"
    plugins:
      - docker-compose#v5.11.0:
          run: "app"
```

Note the second example has no `command` on the first step — plugins run
regardless of whether a step defines one; a plugin-only step is still a
valid command step.

**Version pinning discipline.** Always pin an exact tag (`#v5.13.0`), never
a moving reference like `#main` or no version at all. An unpinned plugin
can change behavior under you the next time an agent checks it out fresh —
the same "pin your dependencies" discipline you'd apply to any package
manager, just enforced by convention rather than a lockfile.

**Writing your own plugin (overview).** A plugin is just a git repository
with a `plugin.yml` describing its configuration schema, plus one or more
executable *hooks* (`environment`, `pre-checkout`, `pre-command`,
`command`, `post-command`, `pre-exit`) — shell scripts Buildkite runs at
the corresponding point in the job lifecycle, with the plugin's
configuration exposed as `BUILDKITE_PLUGIN_<NAME>_<KEY>` environment
variables. You reference your own plugin the same way as a published one,
by git URL and ref: `github.com/myorg/my-plugin#v1.0.0`. Most teams never
need to write one — reach for an existing, well-maintained plugin first.

## vs other tools

| | Buildkite | GitHub Actions | GitLab CI |
|---|---|---|---|
| Reusable step logic | Plugin: git repo + lifecycle hooks, referenced by URL#version | Action: git repo + `action.yml`, referenced by `uses:` | No first-class plugin system — shared logic via `include:` templates |
| Container execution | `docker`/`docker-compose` plugin wraps the command | `container:` key on a job, or a container-based action | `image:` key on a job |
| Version pinning | `#<tag-or-sha>` in the plugin reference | `@<tag-or-sha>` in `uses:` | Image tag / include ref |

The docker/docker-compose plugin pattern is Buildkite's equivalent of
GitHub Actions' `container:` job attribute — the practical difference is
that Buildkite treats containerization as *one plugin among many* rather
than a first-class step attribute, so the same composability (multiple
plugins, custom hooks) applies uniformly.

## Watch out

- **Unpinned plugin versions are a supply-chain risk, not just a
  correctness one** — `docker#latest` or a bare branch ref can pull in
  behavior changes (or malicious changes, if the upstream repo is
  compromised) with zero visibility in your own git history.
- **Plugins run during checkout/command hooks, before step-level `if:`
  conditions are evaluated for skipping** — a skipped step's plugins may
  still execute setup/teardown hooks. Use a `group` step or a dynamic
  pipeline upload if you need to prevent a plugin from running at all
  (see the **conditionals** concept).
- **Not every plugin needs (or accepts) a `command`** — some plugins
  (like `docker-login`) exist purely to run side effects in their hooks;
  check the plugin's own README rather than assuming `command` is
  required.

## The task

Write a `pipeline.yml` with two command steps forming a dockerized
build-and-push chain:

1. **Build and test** — `label: ":docker: Build and test"`,
   `key: "build-test"`, `command: "npm install && npm test"`, with a
   `plugins:` list containing the `docker` plugin pinned at `#v5.13.0`
   configured with `image: "node:20"` and `workdir: "/app"`.
2. **Compose build and push** — `label: ":docker: Compose build and push"`,
   `key: "compose-build"`, `depends_on: "build-test"`, with a `plugins:`
   list containing the `docker-compose` plugin pinned at `#v5.11.0`
   configured with `build: "app"` and
   `image-repository: "index.docker.io/myorg/myapp"`.

Expected shape:

```yaml
steps:
  - label: ":docker: Build and test"
    key: "build-test"
    command: "npm install && npm test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"

  - label: ":docker: Compose build and push"
    key: "compose-build"
    depends_on: "build-test"
    plugins:
      - docker-compose#v5.11.0:
          build: "app"
          image-repository: "index.docker.io/myorg/myapp"
```
