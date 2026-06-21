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
