## What you build

You write a two-step pipeline that builds and tests in a Docker container, then builds and pushes an image. Plugins shape how a step's job runs, most often inside a container instead of on the agent's host. This lesson builds on **Step Dependencies and Gates** and **Conditionals**.

## Key concepts

### `plugins:` is a list of name, version and config

The `plugins:` attribute on a command step is a list. Each entry's key is `<plugin-name>#<version>`. Its value is that plugin's configuration map.

```yaml
steps:
  - command: "yarn install && yarn test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"
```

A plugin with no configuration takes `~` (YAML null) as its value: `- library-example#v1.0.0: ~`. Plugins on one step run in list order, for each lifecycle hook such as checkout and command.

### The `docker` plugin runs the command in one container

The `docker` plugin runs the step's `command` in a container built from `image`, not on the bare agent host. It gives reproducible builds without a hand-written `docker run` in every `command`.

```yaml
steps:
  - label: ":docker: Build and test"
    command: "npm install && npm test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"
```

GitHub Actions has a `container:` job attribute for this. Buildkite makes containers one plugin among many, so multiple plugins and custom hooks combine the same way.

### The `docker-compose` plugin runs many services

For a job with more than one container, such as app, database and cache, use the `docker-compose` plugin. It drives a `docker-compose.yml` in your repo. One step can build an image, and a later step can use it through the build's meta-data store, with no rebuild.

```yaml
steps:
  - label: ":docker: Build and push image"
    plugins:
      - docker-compose#v5.11.0:
          build: "app"
          image-repository: "index.docker.io/myorg/myapp"

  - wait

  - label: ":docker: Test built image"
    command: "test.sh"
    plugins:
      - docker-compose#v5.11.0:
          run: "app"
```

The first step has no `command`. Plugins run without one, so a plugin-only step is still a valid command step.

### Pin every plugin to an exact tag

Always pin an exact tag such as `#v5.13.0`. Never use a moving ref such as `#main`, or no version. An unpinned plugin can change behavior the next time an agent checks it out. The rule is the same as for any package manager, but convention enforces it, not a lockfile.

### A plugin is a git repo with hooks

A plugin is a git repository with a `plugin.yml` that describes its configuration schema. It has one or more executable hooks: `environment`, `pre-checkout`, `pre-command`, `command`, `post-command` and `pre-exit`. Buildkite runs each hook at that point in the job lifecycle.

The hooks read the plugin's configuration from `BUILDKITE_PLUGIN_<NAME>_<KEY>` environment variables. You refer to your own plugin by git URL and ref, for example `github.com/myorg/my-plugin#v1.0.0`. Most teams never write one. Use an existing, well-maintained plugin first.

## Watch out

- An unpinned plugin is a supply-chain risk. `docker#latest` or a branch ref can pull in changes you never see.
- If an attacker compromises the upstream plugin repo, an unpinned ref pulls in the malicious change.
- A shell `if` inside `command` does not stop the step's plugins. Their hooks still run.
- To skip a step and its plugins, use the step's YAML `if:`, a `group` step or a dynamic pipeline upload.
- Some plugins, such as `docker-login`, need no `command`. Read the plugin's README before you add one.

## The task

Write a pipeline in `stub.yaml` with two command steps. The first builds and tests in Docker, and the second builds and pushes an image. Step labels are free text: the checks do not read them, so a label can differ from the stub's comment.

1. Build and test: `label: ":docker: Build and test"`, `key: "build-test"`, `command: "npm install && npm test"`.
2. Give it a `plugins:` list with `docker#v5.13.0`, configured with `image: "node:20"` and `workdir: "/app"`.
3. Compose build and push: `label: ":docker: Compose build"`, `key: "compose-build"`, `depends_on: "build-test"`.
4. Give it a `plugins:` list with `docker-compose#v5.11.0`, configured with `build: "app"`.
5. Also set `image-repository: "index.docker.io/myorg/myapp"` on that plugin.

```yaml
steps:
  - label: ":docker: Build and test"
    key: "build-test"
    command: "npm install && npm test"
    plugins:
      - docker#v5.13.0:
          image: "node:20"
          workdir: "/app"

  - label: ":docker: Compose build"
    key: "compose-build"
    depends_on: "build-test"
    plugins:
      - docker-compose#v5.11.0:
          build: "app"
          image-repository: "index.docker.io/myorg/myapp"
```
