## What you build

You write the `Chart.yaml` and the `values.yaml` of a chart named `webapp`. The chart has one dependency on the Bitnami `redis` chart.

## Key concepts

### The directory layout is the configuration

Helm reads files by their place in the chart directory. No configuration file points at your templates. If a file is in the wrong place, Helm does not read it, and your change does not show.

```
mychart/
  # Required: chart metadata
  Chart.yaml
  # Defaults; you override them at install
  values.yaml
  # Unpacked chart dependencies
  charts/
  # Go templates rendered against values
  templates/
  # Named templates, not rendered alone
  templates/_helpers.tpl
  # Printed after install
  templates/NOTES.txt
```

### `Chart.yaml` holds the chart metadata

Each field has a job. `apiVersion: v1` is for Helm 2 only, so always use `v2`. A `library` chart exports only named templates.

```yaml
apiVersion: v2
# Must match the directory name
name: myapp
description: A production-ready app chart
# "application" or "library"
type: application
# Chart semver: bump on every change
version: 1.2.0
# The packaged app version: information
appVersion: "4.7.1"
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: >-
      https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

### `version` and `appVersion` are different

`version` is the semver of the chart. `appVersion` is the version of the app the chart packages. The two change independently.

### `values.yaml` holds the defaults

`values.yaml` is the contract between the chart author and the operator. Every value in it is a default. The operator overrides values with `-f custom-values.yaml` or `--set key=value`.

```yaml
replicaCount: 1

image:
  repository: myregistry/myapp
  # Empty on purpose: set at deploy time
  tag: ""
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

# Empty map: the operator fills it in
resources: {}
```

### `charts/` holds the dependencies

`helm dependency update` reads the `dependencies` block of `Chart.yaml` and puts the subchart archives in `charts/`. You can commit `charts/` or treat it like a lockfile. Choose one and be consistent.

### Files that start with `_` do not render

Helm does not render `_helpers.tpl` as a manifest. The file holds `{{- define "..." }}` blocks that other templates call. By convention, the main helpers file is `_helpers.tpl`.

### Helm compared with Kustomize

Kustomize merges patches onto manifests and has no packages, while Helm renders Go templates and ships charts as `.tgz` packages. Many teams use both: `helm template | kubectl apply -k`.

## Watch out

- `name` in `Chart.yaml` is not cosmetic. Helm uses it with `.Release.Name` to build resource names and labels.
- A directory `webapp/` with `name: my-app` is legal but confusing. Keep the two names the same.
- `version` must be valid semver: `MAJOR.MINOR.PATCH`, with an optional pre-release suffix. `helm lint` and `helm package` reject `1.0` and `latest`.
- `appVersion` is a free-form string. Quote it, or YAML reads `2.30` as the float `2.3`.
- The `dependencies` block only declares subcharts. Nothing downloads them until you run `helm dependency update`.
- A chart with a `dependencies` block and an empty `charts/` directory fails to install.
- `values.yaml` has no schema by default. Helm ignores a typo like `replicaCont: 2` without an error.
- The template that reads `.Values.replicaCount` then gets its default or nil. A later concept adds `values.schema.json` to close this gap.

## The task

Write the two files of a chart named `webapp` in `stub.yaml`. Put `Chart.yaml` first, then a `---` line, then `values.yaml`.

1. `Chart.yaml` sets `apiVersion: v2`, `name: webapp` and `type: application`.
2. `Chart.yaml` sets the chart `version` to `0.1.0` and `appVersion` to `"2.3.1"`.
3. `Chart.yaml` has a non-empty `description`.
4. `Chart.yaml` lists one dependency: `redis`, version `"17.x.x"`, from `https://charts.bitnami.com/bitnami`.
5. The `redis` dependency has the condition `redis.enabled`.
6. `values.yaml` sets `replicaCount: 2`.
7. `values.yaml` has an `image` block: `repository: myregistry/webapp`, `tag: ""` and `pullPolicy: IfNotPresent`.
8. `values.yaml` has a `redis` block with `enabled: true`.

The `redis:` block must come after the `---` line. It belongs to `values.yaml`, not to `Chart.yaml`.

```yaml
apiVersion: v2
name: webapp
description: A web application chart
type: application
version: 0.1.0
appVersion: "2.3.1"
dependencies:
  - name: redis
    version: "17.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
---
replicaCount: 2

image:
  repository: myregistry/webapp
  tag: ""
  pullPolicy: IfNotPresent

redis:
  enabled: true
```
