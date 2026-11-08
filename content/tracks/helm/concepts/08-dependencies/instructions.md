## What you build

You write a `Chart.yaml` for a chart named `platform` with PostgreSQL and Redis dependencies, and the `values.yaml` that configures them. Redis gets the alias `cache`. This lesson builds on **Hooks**.

## Key concepts

### A dependency pulls in another chart as a subchart

You do not write a PostgreSQL StatefulSet yourself. You declare a dependency on the Bitnami PostgreSQL chart and configure it from your `values.yaml`.

```yaml
dependencies:
  - name: postgresql
    # A semver constraint
    version: "12.x.x"
    repository: >-
      https://charts.bitnami.com/bitnami
    # Skip when this value is false
    condition: postgresql.enabled
    # Optional: rename the subchart
    alias: db

  - name: redis
    version: "17.x.x"
    repository: >-
      https://charts.bitnami.com/bitnami
    # Turn groups on and off by tag
    tags:
      - cache
```

### `helm dependency update` downloads the charts

The command resolves the constraints and downloads the chart archives into `charts/`. It writes `Chart.lock` with the exact versions. Run it before `helm install` each time the dependencies change. Commit `Chart.lock`. Commit `charts/` only when you need reproducible offline builds.

### `condition` toggles one chart; `tags` toggle a group

- `condition: redis.enabled` reads `.Values.redis.enabled`. If it is false, Helm skips the subchart.
- `tags` is a list of tag names. A matching tag in `.Values.tags` turns the whole group on or off.

Conditions take precedence over tags. Use `condition` for one chart and `tags` for a feature bundle.

### Parent values configure a subchart under its name

In the parent `values.yaml`, the subchart values go under the dependency name, or under its alias. The subchart gets them without the parent key, for example as `.Values.auth.username`.

```yaml
# Parent values.yaml
# Must match the dependency name or alias
postgresql:
  auth:
    username: myapp
    password: secret
    database: myappdb
  primary:
    persistence:
      size: 10Gi
```

With `alias: db`, the key in `values.yaml` is `db:`, not `postgresql:`.

### The parent cannot read subchart values

The dependency boundary goes one way. To use a value from inside the subchart, read it from a Secret or ConfigMap that the subchart creates. Or set the value again at the parent level.

### All charts read `global` values

Values under `.Values.global` are the one exception. The parent and all subcharts can read them. Many charts support `global.imageRegistry` for this reason.

```yaml
# Parent values.yaml
global:
  imageRegistry: "myregistry.example.com"
  storageClass: "fast-ssd"
```

### Terraform modules work in a similar way

Like Terraform modules, you pin versions, resolve them with one command and pass inputs to the child. Unlike Terraform, Helm renders each subchart on its own and adds its resources to the manifest set.

## Watch out

- `alias` renames the values key everywhere, `condition` included.
- With `alias: cache` on `redis`, a condition on the cache values must read `cache.enabled`.
- If you skip `helm dependency update`, `helm install` fails with "found in Chart.yaml, but missing in charts/ directory".
- Run `helm dependency update` or `helm dependency build` after each edit of the `dependencies` block.
- A parent template cannot read a value that the subchart computes, like a generated password.
- To share a runtime value, use a Secret or ConfigMap that both charts read. The values tree cannot carry it.
- All charts read `global`, but do not trust deep nesting under `global` to merge the same way across chart versions.
- Keep `global` flat and small: a registry, a storage class, a few feature flags.

## The task

Write `Chart.yaml` and `values.yaml` in `stub.yaml`, with a `---` line between them. The chart name is `platform`.

1. Add a `postgresql` dependency, version `"12.x.x"`, from `https://charts.bitnami.com/bitnami`.
2. Give the `postgresql` dependency `condition: postgresql.enabled`.
3. Add a `redis` dependency, version `"17.x.x"`, from `https://charts.bitnami.com/bitnami`.
4. Give the `redis` dependency `condition: redis.enabled` and `alias: cache`.
5. In `values.yaml`, set `global.imageRegistry: "gcr.io/myproject"`.
6. Add a `postgresql:` block with `enabled: true`, `auth.database: myplatform` and `auth.username: platform`.
7. Add a `cache:` block with `enabled: true` and `master.persistence.enabled: false`.
8. Do not add a top-level `redis:` block to `values.yaml`.
9. Remove every `TODO` comment.

The alias renames how the parent addresses the Redis chart, so its values go under `cache:`. The Redis chart still reads them as `.Values.enabled` and `.Values.master.persistence.enabled`.

```yaml
# Chart.yaml (after the existing fields)
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
  - name: redis
    version: "17.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
    alias: cache
---
# values.yaml
global:
  imageRegistry: "gcr.io/myproject"

postgresql:
  enabled: true
  auth:
    database: myplatform
    username: platform

cache:
  enabled: true
  master:
    persistence:
      enabled: false
```
