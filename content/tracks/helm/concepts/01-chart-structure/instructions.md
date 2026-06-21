# Chart Structure

## What you'll learn

A Helm chart is a directory tree with a strict layout. Helm reads specific files by convention — there is no config file pointing at your templates; the directory structure *is* the config. Understanding what each file does and when Helm reads it prevents the frustrating "why is my change not showing up" class of bugs.

## Key concepts

**The canonical layout:**

```
mychart/
  Chart.yaml          # required — chart metadata
  values.yaml         # default values, overridable at install time
  charts/             # unpacked chart dependencies
  templates/          # Go template files rendered against values
  templates/_helpers.tpl   # named templates (not rendered directly)
  templates/NOTES.txt      # printed to stdout after install
```

**Chart.yaml** — every field matters:

```yaml
apiVersion: v2          # v1 = Helm 2 only; always use v2
name: myapp             # must match the directory name
description: A production-ready app chart
type: application       # or "library" — library charts export named templates only
version: 1.2.0          # chart version (semver) — bump on every chart change
appVersion: "4.7.1"     # version of the app being packaged — informational only
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

`version` vs `appVersion`: `version` is the chart's own semver; `appVersion` tracks what you're packaging. They can and do drift independently.

**values.yaml** — the contract between chart author and operator:

```yaml
replicaCount: 1

image:
  repository: myregistry/myapp
  tag: ""           # intentionally empty — set at deploy time
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources: {}       # empty map — operator fills this in per environment
```

Everything in `values.yaml` is the default. Operators override with `-f custom-values.yaml` or `--set key=value`.

**The `charts/` directory** holds vendored (unpacked) subchart tarballs. `helm dependency update` populates it from `Chart.yaml`'s `dependencies` block. Commit `charts/` or treat it like a lockfile — your choice, but be consistent.

**`_helpers.tpl`** — files starting with `_` are not rendered as standalone manifests. They exist solely to hold `{{- define "..." }}` blocks that other templates call. By convention, the main helpers file is `_helpers.tpl`.

## vs other tools

| | Helm | Kustomize | Raw manifests |
|---|---|---|---|
| Parameterization | Go templates + values files | Strategic merge patches | Copy-paste + sed |
| Packaging | `.tgz` pushed to OCI/chart repo | No packaging — git refs | No packaging |
| Conditionals | Full Go template logic | Limited (components) | None |
| Dependencies | `Chart.yaml` dependencies block | Bases via remote refs | None |

Kustomize is declarative and merge-based — good for ops teams applying overlays they don't own. Helm is programmable — good for app teams shipping reusable charts. The two aren't mutually exclusive; many teams run `helm template | kubectl apply -k`.

## The task

Fill in `Chart.yaml` with the correct fields for a chart named `webapp` that:

- Uses `apiVersion: v2`
- Has chart version `0.1.0`
- Has app version `2.3.1`
- Is of type `application`
- Has a short description
- Lists a dependency on `redis` version `"17.x.x"` from `https://charts.bitnami.com/bitnami` with the condition `redis.enabled`

Also provide a `values.yaml` with:

- `replicaCount: 2`
- `image.repository: myregistry/webapp`, `image.tag: ""`, `image.pullPolicy: IfNotPresent`
- `redis.enabled: true`
