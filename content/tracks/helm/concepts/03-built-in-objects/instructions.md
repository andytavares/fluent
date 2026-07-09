# Built-in Objects

## What you'll learn

Helm injects a set of built-in objects into every template render. These aren't values from `values.yaml` — they're Helm-provided context about the release, the chart, the cluster, and the template itself. Knowing what each object exposes lets you write charts that adapt to their deployment context without requiring operators to duplicate information they don't own.

## Key concepts

**`.Release`** — facts about this specific installation:

| Field | Type | Example |
|---|---|---|
| `.Release.Name` | string | `myapp-prod` |
| `.Release.Namespace` | string | `production` |
| `.Release.Revision` | int | `3` (increments each upgrade) |
| `.Release.IsInstall` | bool | `true` on first install |
| `.Release.IsUpgrade` | bool | `true` on upgrade |
| `.Release.Service` | string | always `"Helm"` |

Use `.Release.IsInstall` / `.Release.IsUpgrade` to gate one-time setup jobs vs. migration jobs:

```yaml
{{- if .Release.IsInstall }}
# Only runs on fresh install, not upgrades
{{- end }}
```

**`.Chart`** — the parsed contents of `Chart.yaml`:

```yaml
labels:
  chart: {{ .Chart.Name }}-{{ .Chart.Version }}   # myapp-1.2.0
  app-version: {{ .Chart.AppVersion | quote }}     # "4.7.1"
```

**`.Values`** — the merged result of `values.yaml` + all `-f` overrides + `--set` flags. This is the object you use most. It's just a deeply-nested Go map, so `.Values.a.b.c` walks the hierarchy.

**`.Files`** — access to non-template files bundled in the chart:

```yaml
data:
  config.properties: |
    {{ .Files.Get "config/app.properties" | indent 4 }}
```

Files must live inside the chart directory. `templates/` and `charts/` are excluded. `.Files.AsSecrets` base64-encodes the content for use in Secrets.

**`.Capabilities`** — information about the target cluster:

```yaml
{{- if .Capabilities.APIVersions.Has "networking.k8s.io/v1" }}
apiVersion: networking.k8s.io/v1
{{- else }}
apiVersion: networking.k8s.io/v1beta1
{{- end }}
```

`.Capabilities.KubeVersion.GitVersion` returns the full version string (e.g. `v1.28.4`). Use this to write charts that gracefully degrade on older clusters.

**`.Template`** — metadata about the template currently being rendered:

```yaml
annotations:
  meta.helm.sh/template: {{ .Template.Name }}  # e.g. "myapp/templates/deployment.yaml"
```

`.Template.BasePath` gives just the `templates/` directory path. Rarely needed except for advanced debugging annotations.

## vs other tools

Raw Kubernetes manifests have no equivalent to these objects — you'd have to inject them with `envsubst`, `sed`, or CI pipeline variables. Kustomize lets you set a namespace via `namespace:` in `kustomization.yaml`, but it doesn't give templates access to the release name, revision, or cluster capabilities. Helm's built-in objects are what make the same chart safely installable multiple times in the same namespace.

## Watch out

- **Built-in objects are capitalized; values are not.** `.Release.Name` (capital R, capital N) vs `.Values.replicaCount` (capital V, lowercase everything after). Mixing these up (`.release.name`) fails silently — Go templates treat an unknown lowercase field as a nil, rendering blank rather than erroring loudly.
- **`.Release.Namespace` is not always what you expect.** If an operator runs `helm install myapp ./chart` with no `-n` flag, `.Release.Namespace` is whatever `--namespace` defaults to for their kubeconfig context (often `default`), not necessarily the namespace the chart author intended. Don't hardcode assumptions about namespace in templates — always reference `.Release.Namespace`.
- **`.Capabilities` reflects the *target* cluster, not your local Helm client version.** `.Capabilities.KubeVersion` is populated by querying the cluster Helm is connecting to — it's unavailable (and `.Capabilities.APIVersions` is empty) when running `helm template` offline without `--kube-version` / `--api-versions` flags to fake it.
- **`.Template.Name` includes the chart's own directory prefix** (e.g. `webapp/templates/configmap.yaml`), not just the filename — useful for debugging annotations across subcharts where multiple templates could share a filename.

## The task

Write a `templates/configmap.yaml` that:

- Sets `metadata.name` to `{{ .Release.Name }}-config`
- Sets `metadata.namespace` to `{{ .Release.Namespace }}`
- Adds these labels:
  - `app.kubernetes.io/name: {{ .Chart.Name }}`
  - `app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}`
  - `helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}`
- Adds an annotation `meta.helm.sh/template: {{ .Template.Name }}`
- In `data`, sets `install_mode` to `"install"` if `.Release.IsInstall` is true, otherwise `"upgrade"`
- In `data`, sets `kube_version` to `{{ .Capabilities.KubeVersion.GitVersion }}`

For example, on a **first install** (`helm install myapp ./webapp -n staging`) of a chart with `Chart.yaml` containing `name: webapp`, `version: 1.4.0`, `appVersion: "2.3.1"`, against a cluster running Kubernetes `v1.28.4`, the rendered ConfigMap looks like:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: staging
  labels:
    app.kubernetes.io/name: webapp
    app.kubernetes.io/version: "2.3.1"
    helm.sh/chart: webapp-1.4.0
  annotations:
    meta.helm.sh/template: webapp/templates/configmap.yaml
data:
  install_mode: "install"
  kube_version: v1.28.4
```

Running `helm upgrade` against that same release (where `.Release.IsInstall` is now `false`) must render `install_mode: "upgrade"` instead, with every other field unchanged.
