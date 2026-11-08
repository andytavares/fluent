## What you build

You write a ConfigMap that reads release, chart, template and cluster data from the Helm built-in objects. It records if the release is an install or an upgrade. This lesson builds on **Templates & Values**.

## Key concepts

### Helm adds built-in objects to every render

Built-in objects do not come from `values.yaml`. Helm supplies them: data about the release, the chart, the cluster and the template. With them, the operator does not copy data into values that Helm already knows.

### `.Release` describes this installation

| Field | Type | Example |
|---|---|---|
| `.Release.Name` | string | `myapp-prod` |
| `.Release.Namespace` | string | `production` |
| `.Release.Revision` | int | `3`, +1 on each upgrade |
| `.Release.IsInstall` | bool | `true` on first install |
| `.Release.IsUpgrade` | bool | `true` on upgrade |
| `.Release.Service` | string | always `"Helm"` |

Use `.Release.IsInstall` and `.Release.IsUpgrade` to choose between one-time setup jobs and migration jobs.

```yaml
{{- if .Release.IsInstall }}
# Only on a fresh install, not on upgrades
{{- end }}
```

### `.Chart` is the content of `Chart.yaml`

```yaml
labels:
  # Renders as: myapp-1.2.0
  chart: {{ .Chart.Name }}-{{ .Chart.Version }}
  # Renders as: "4.7.1"
  app-version: {{ .Chart.AppVersion | quote }}
```

### `.Values` is the merged values

`.Values` merges `values.yaml`, all `-f` files and all `--set` flags. It is a nested Go map, so `.Values.a.b.c` walks down the tree.

### `.Files` reads other files in the chart

The files must be inside the chart directory. `.Files` cannot read files in `templates/` or `charts/`. `.Files.AsSecrets` encodes the content as base64 for a Secret.

```yaml
data:
  app.properties: |
    {{- .Files.Get "config/app.properties"
        | nindent 4 }}
```

### `.Capabilities` describes the target cluster

`.Capabilities.KubeVersion.GitVersion` returns the full version, for example `v1.28.4`. Use `.Capabilities` to support older clusters.

```yaml
{{- $v1 := "networking.k8s.io/v1" }}
{{- if .Capabilities.APIVersions.Has $v1 }}
apiVersion: networking.k8s.io/v1
{{- else }}
apiVersion: networking.k8s.io/v1beta1
{{- end }}
```

### `.Template` describes the current template

`.Template.Name` is the path of the template that Helm renders now. `.Template.BasePath` is the path of the `templates/` directory. You use it mostly in debug annotations.

```yaml
annotations:
  # webapp/templates/deployment.yaml
  meta.helm.sh/template: {{ .Template.Name }}
```

### Other tools have no built-in objects

With raw manifests, you inject these values with `envsubst`, `sed` or CI variables. Kustomize can set a namespace, but it gives no release name, revision or cluster data.

## Watch out

- Built-in objects start with a capital letter. Values do not, for example `.Values.replicaCount`.
- `.release.name` does not read the release name. Helm stops with `nil pointer evaluating interface {}.name`.
- With no `-n` flag, `.Release.Namespace` is the namespace of the kubeconfig context. That is often `default`.
- Do not hardcode a namespace in a template. Always use `.Release.Namespace`.
- `.Capabilities` describes the target cluster, not your local Helm client.
- `helm template` does not connect to a cluster. It uses a built-in Kubernetes version unless you pass `--kube-version`.
- `helm template` fills `.Capabilities.APIVersions` from `--api-versions`, not from a real cluster.
- `.Template.Name` starts with the chart directory, for example `webapp/templates/configmap.yaml`. This helps when two subcharts use the same file name.

## The task

Write `templates/configmap.yaml` in `stub.yaml`. The ConfigMap reads every field from a built-in object.

1. Set `metadata.name` to `{{ .Release.Name }}-config`.
2. Set `metadata.namespace` to `{{ .Release.Namespace }}`.
3. Add the label `app.kubernetes.io/name: {{ .Chart.Name }}`.
4. Add the label `app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}`.
5. Add the label `helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}`.
6. Add the annotation `meta.helm.sh/template: {{ .Template.Name }}`.
7. Set `data.install_mode` to `"install"` when `.Release.IsInstall` is true. Otherwise set it to `"upgrade"`.
8. Set `data.kube_version` to `{{ .Capabilities.KubeVersion.GitVersion }}`.
9. Use capital letters: `.Release` and `.Chart`, never `.release` or `.chart`.
10. Remove every `TODO` comment.

Write the `install_mode` condition on the same line as `install_mode:`.

```yaml
# helm install myapp ./webapp -n staging
# Chart: webapp 1.4.0, appVersion "2.3.1"
# Cluster: Kubernetes v1.28.4
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
    meta.helm.sh/template: >-
      webapp/templates/configmap.yaml
data:
  install_mode: "install"
  kube_version: v1.28.4

# After helm upgrade, only this changes:
  install_mode: "upgrade"
```
