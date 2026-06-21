# Named Templates

## What you'll learn

Named templates let you define a reusable block once and call it from multiple template files. This is how Helm charts avoid copy-pasting the same label set across every Deployment, Service, and ConfigMap. The convention lives in `_helpers.tpl`, and the mechanics hinge on understanding the difference between `template` and `include`.

## Key concepts

**`{{- define }}`** — declares a named template block:

```yaml
{{/* _helpers.tpl */}}
{{- define "myapp.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}
```

The name is a string — by convention `<chartname>.<purpose>`. This scoping prevents collisions when charts are composed as subcharts.

**`{{- template }}` vs `{{- include }}`** — this is the most important distinction in named templates:

```yaml
# template — cannot be piped; output is emitted directly
labels:
  {{- template "myapp.labels" . }}

# include — returns a string, can be piped to indent/nindent
labels:
  {{- include "myapp.labels" . | nindent 2 }}
```

**Always use `include` instead of `template`** in real charts. `template` cannot be combined with pipeline functions, which means you can't control indentation. `include` returns the rendered content as a string, letting you pipe it to `nindent` or `indent`.

**`nindent` vs `indent`** — `nindent N` prepends a newline then indents every line by N spaces. `indent N` indents without the leading newline. In practice, `nindent` after `{{-` is the correct pattern:

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

**Passing context (the `.`)** — the second argument to `include`/`template` is the scope passed into the block. Almost always pass `.` (the current root context). Inside the defined block, `.` is whatever you passed. You can pass a sub-object (`include "myapp.thing" .Values.config`) to scope the block to just that map.

**`_helpers.tpl` conventions:**

- One file per chart, located at `templates/_helpers.tpl`
- Files starting with `_` are never rendered as standalone manifests
- Group related templates with comments: `{{/* Selector labels — subset of full labels */}}`
- Define both a "full labels" and a "selector labels" template — selector labels must be immutable once set (Kubernetes doesn't let you change them on existing Deployments)

```yaml
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

## vs other tools

Kustomize has no equivalent to named templates — you cannot define a label block and reuse it across multiple resources without repeating it in each patch file. Terraform has modules and locals for this kind of reuse. CDK8s has actual functions and classes. Helm's named templates are the closest thing to a function in a YAML-first world: not ideal, but workable once you understand the `include | nindent` pattern.

## The task

Write a `templates/_helpers.tpl` that defines these three named templates for a chart named `webapp`:

1. `webapp.fullname` — returns `{{ .Release.Name }}-{{ .Chart.Name }}`, truncated to 63 chars with `trunc 63 | trimSuffix "-"`
2. `webapp.labels` — the full label set: `app.kubernetes.io/name`, `app.kubernetes.io/instance`, `app.kubernetes.io/version` (quoted), `helm.sh/chart`
3. `webapp.selectorLabels` — just `app.kubernetes.io/name` and `app.kubernetes.io/instance`

Then write a `templates/service.yaml` that uses `include` with `nindent` to apply `webapp.labels` in `metadata.labels` and `webapp.selectorLabels` in `spec.selector`.
