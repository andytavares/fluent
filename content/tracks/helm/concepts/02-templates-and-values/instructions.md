# Templates & Values

## What you'll learn

Helm templates are Kubernetes YAML files with Go's `text/template` syntax embedded. The template engine replaces `{{ ... }}` expressions before sending manifests to the API server. This concept covers the three things you'll write in every template: referencing values, referencing release metadata, and setting safe defaults.

## Key concepts

**The `{{ }}` delimiter** — double curly braces signal a template expression. Everything outside them is emitted as-is.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-webapp    # rendered: myrelease-webapp
```

**`.Values`** — the dot-separated path into `values.yaml`:

```yaml
# values.yaml
image:
  repository: myregistry/app
  tag: "1.0.0"
  pullPolicy: IfNotPresent
```

```yaml
# templates/deployment.yaml
containers:
  - name: app
    image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
    imagePullPolicy: {{ .Values.image.pullPolicy }}
```

**`.Release.Name` and `.Chart.Name`** — the two most-used built-in strings. Use them to make resource names unique per release, so two releases in the same namespace don't collide:

```yaml
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
```

**`| default`** — provides a fallback when a value is empty, zero, or not set. This is the idiomatic way to handle optional values rather than requiring operators to always set them:

```yaml
image: {{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}
replicas: {{ .Values.replicaCount | default 1 }}
```

`default` is a Sprig function (Helm's extended template library). The pattern `{{ .Values.something | default "fallback" }}` reads: "render `.Values.something`, or if it's falsy, render `"fallback"`".

**Quoting strings** — always pipe string values through `quote` when the value might be numeric-looking but should stay a string:

```yaml
annotations:
  version: {{ .Values.appVersion | quote }}  # prevents YAML interpreting "1.0" as float
```

## vs other tools

Helm templates are Go's `text/template`, not Jinja2, not ERB, not Mustache. The biggest practical difference: Go templates are **type-aware**. A value that's a map in `values.yaml` stays a Go map in the template — you can range over it, check its length, and pass it to functions. Kustomize has no equivalent; its "variables" are simple string substitutions with `$(VAR)`.

The Sprig library (bundled with Helm) adds ~70 functions on top of Go's built-in template functions. When something seems like it should work but doesn't, check whether you need a Sprig function rather than a raw Go template expression.

## The task

Write a `templates/deployment.yaml` that:

- Sets `metadata.name` to `{{ .Release.Name }}-webapp`
- Sets `metadata.labels` with `app.kubernetes.io/name: {{ .Chart.Name }}` and `app.kubernetes.io/instance: {{ .Release.Name }}`
- Sets `spec.replicas` from `.Values.replicaCount` with a default of `1`
- Sets the container image as `{{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}`
- Sets `imagePullPolicy` from `.Values.image.pullPolicy` with a default of `"IfNotPresent"`
- Sets `containerPort` from `.Values.service.port` with a default of `80`
