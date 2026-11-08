## What you build

You write three named templates in `_helpers.tpl`: a full name, a full label set and a selector label set. A Service then calls them with `include`. This lesson builds on **Control Flow**.

## Key concepts

### `define` declares a named template

A named template is a block that you define once and call from many template files. Then you do not copy the same labels into every Deployment, Service and ConfigMap.

```yaml
{{/* _helpers.tpl */}}
{{- define "myapp.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

### Name templates `<chartname>.<purpose>`

The name is a string. The chart name in front prevents collisions when a chart is a subchart of another chart.

### `include` returns a string; `template` does not

`template` writes its output directly, so you cannot pipe it. `include` returns the output as a string, so you can pipe it to `indent` or `nindent`. Always use `include` in real charts.

```yaml
# template: no pipe, no indent control
labels:
  {{- template "myapp.labels" . }}

# include: pipe it to nindent
labels:
  {{- include "myapp.labels" . | nindent 2 }}
```

### `nindent` adds a newline, then indents

`nindent N` adds a newline, then indents every line by N spaces. `indent N` indents with no newline. Use `nindent` after `{{-`.

```yaml
metadata:
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
```

This renders as:

```yaml
metadata:
  labels:
    app.kubernetes.io/name: myapp
    app.kubernetes.io/instance: prod
```

### The second argument is the scope

The second argument of `include` and `template` becomes `.` inside the block. Pass `.`, the root, in most calls. To scope the block to one map, pass that map: `include "myapp.thing" .Values.config`.

### `_helpers.tpl` follows conventions

- Each chart has one file, `templates/_helpers.tpl`.
- Helm never renders a file that starts with `_` as a manifest.
- Group related templates with comments, for example `{{/* Selector labels */}}`.
- Define a full label set and a selector label set.
- Selector labels must not change after the first install. Kubernetes does not let you change them on an existing Deployment.

```yaml
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

### Named templates are the Helm functions

Kustomize cannot define a label block once and reuse it, while Terraform has modules and locals, and CDK8s has functions and classes. In Helm, the `include | nindent` pattern is the closest thing to a function.

## Watch out

- You cannot indent `template` output. It starts at the column of the tag.
- With `template`, the indentation can be wrong with no error until `kubectl apply` rejects the manifest. Use `include | nindent`.
- `define` names are global across the chart and its subcharts.
- Two charts that define `webapp.labels` clash with no warning. The last one rendered wins. Always use the `<chartname>.<purpose>` names.
- `nindent` adds its own newline. `{{- include "x" . | nindent 4 }}` needs the `{{-` to remove the newline before the tag.
- Without the `-` in `{{-`, a blank line comes before the included content.
- The whitespace of a `define` block is part of the string that `include` returns.
- `{{- define "x" -}}` removes the newline after the opening tag. Without the `-}}`, each `include "x"` starts with a blank line.

## The task

Write `templates/_helpers.tpl` and `templates/service.yaml` in `stub.yaml`, in that order. The chart name is `webapp`.

1. Define `webapp.fullname`. It returns `.Release.Name`, a `-` and `.Chart.Name`, through `trunc 63 | trimSuffix "-"`.
2. Define `webapp.labels`: `app.kubernetes.io/name`, `app.kubernetes.io/instance`, `app.kubernetes.io/version` (quoted) and `helm.sh/chart`.
3. Define `webapp.selectorLabels`: `app.kubernetes.io/name` and `app.kubernetes.io/instance` only.
4. Open each block with `{{- define "<name>" -}}`, so the output has no leading blank line.
5. Set the Service `metadata.name` to `{{ include "webapp.fullname" . }}`.
6. Set `metadata.labels` with `include "webapp.labels" . | nindent 4`.
7. Set `spec.selector` with `include "webapp.selectorLabels" . | nindent 4`.
8. Remove every `TODO` comment.

`printf "%s-%s" .Release.Name .Chart.Name` builds the same full name. Define it once, so each template calls one named template.

```yaml
# Release myrelease, chart webapp 1.4.0,
# appVersion "2.3.1"
apiVersion: v1
kind: Service
metadata:
  name: myrelease-webapp
  labels:
    app.kubernetes.io/name: webapp
    app.kubernetes.io/instance: myrelease
    app.kubernetes.io/version: "2.3.1"
    helm.sh/chart: webapp-1.4.0
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: webapp
    app.kubernetes.io/instance: myrelease
```
