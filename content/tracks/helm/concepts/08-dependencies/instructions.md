# Dependencies

## What you'll learn

Helm's dependency system lets your chart pull in other charts as subcharts. Instead of writing a PostgreSQL StatefulSet from scratch, you declare a dependency on the Bitnami PostgreSQL chart and configure it through your `values.yaml`. This concept covers the mechanics: how dependencies are declared, resolved, and configured — and the parent/child values pattern that trips up almost everyone the first time.

## Key concepts

**Declaring dependencies in `Chart.yaml`:**

```yaml
dependencies:
  - name: postgresql
    version: "12.x.x"           # semver constraint
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled  # skip if this value is false
    alias: db                   # optional: rename the subchart

  - name: redis
    version: "17.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    tags:
      - cache                   # enable/disable by tag group
```

**`helm dependency update`** resolves the constraints, downloads chart tarballs into `charts/`, and writes `Chart.lock` with the exact resolved versions. Always run this before `helm install` when dependencies change. Commit `Chart.lock`; commit `charts/` only if you need reproducible offline builds.

**`condition` vs `tags`:**

- `condition: redis.enabled` — checks `.Values.redis.enabled`; if false, the subchart is skipped entirely
- `tags` — a list of tag names; any tag in `.Values.tags` that matches disables/enables the whole group

Conditions take precedence over tags. Use `condition` for individual chart toggles, `tags` for enabling/disabling feature bundles.

**Configuring subcharts via parent values** — this is the part that confuses people. Subchart values are namespaced under the chart name (or alias) in the parent's `values.yaml`:

```yaml
# parent values.yaml
postgresql:           # must match the dependency "name" (or "alias")
  auth:
    username: myapp
    password: secret
    database: myappdb
  primary:
    persistence:
      size: 10Gi
```

The subchart receives these as its own `.Values.auth.username`, etc. — the parent namespace is stripped. If you used `alias: db`, the key in `values.yaml` would be `db:` instead of `postgresql:`.

**Accessing subchart values from the parent** — you can't, directly. The dependency boundary is one-way. If you need a value that's set inside the subchart, you either read it from a known Secret/ConfigMap the subchart creates, or you duplicate the value at the parent level.

**Global values** — the one exception to the one-way boundary. Any value under `.Values.global` is shared across the parent and all subcharts:

```yaml
# parent values.yaml
global:
  imageRegistry: "myregistry.example.com"
  storageClass: "fast-ssd"
```

Both parent and subcharts can read `.Values.global.imageRegistry`. Many charts support `global.imageRegistry` specifically for this reason.

## vs other tools

Terraform modules are a closer analogy than you'd expect — you declare module sources with version constraints, run `terraform init` to resolve them (analogous to `helm dependency update`), and configure child modules by passing input variables (analogous to parent values namespacing). The key difference: Terraform modules compose into a single plan; Helm subcharts are independently rendered and their resources are just added to the manifest set.

Docker Compose `extends` and Kustomize `bases` are weaker — they don't have version pinning or a registry concept.

## The task

Write a `Chart.yaml` for a chart named `platform` that declares:

1. A `postgresql` dependency, version `"12.x.x"`, from `https://charts.bitnami.com/bitnami`, with `condition: postgresql.enabled`
2. A `redis` dependency, version `"17.x.x"`, from `https://charts.bitnami.com/bitnami`, with `condition: redis.enabled` and `alias: cache`

Then write a `values.yaml` that:

- Enables postgresql: `postgresql.enabled: true`
- Configures `postgresql.auth.database: myplatform`, `postgresql.auth.username: platform`
- Enables redis via alias: `cache.enabled: true`
- Sets a global image registry: `global.imageRegistry: "gcr.io/myproject"`
- Disables the `cache` subchart's persistence: `cache.master.persistence.enabled: false`
