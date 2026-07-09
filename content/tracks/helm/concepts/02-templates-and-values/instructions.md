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

## Watch out

- **A missing key does not error — it renders as `<no value>` or an empty string.** `{{ .Values.image.tag }}` with no `tag` key produces `image: myregistry/app:` — a manifest the API server will likely reject, but Helm itself renders it "successfully." Always pair values that might be absent with `| default ...` or `required "message" ...`.
- **Nested missing maps panic, not just render empty.** `{{ .Values.image.repository }}` fails at render time with `nil pointer evaluating interface {}.repository` if `.Values.image` itself doesn't exist (rather than existing with no `repository` key). This is different from a missing *leaf* value — the map itself has to exist. Always give every nested object at least an empty placeholder in `values.yaml` (e.g. `image: {}`) so template code can safely reach one level deeper.
- **`default` treats zero values as "unset."** `{{ .Values.replicaCount | default 1 }}` returns `1` if an operator explicitly sets `replicaCount: 0` — because `0` is falsy in Go templates, same as `""` and `false`. If you need to distinguish "explicitly zero" from "not set," check with `{{- if hasKey .Values "replicaCount" }}` instead.
- **Quote anything that could be misread as a non-string.** `tag: 1.20` in `values.yaml` is parsed as a YAML float and becomes `1.2` — silently dropping the trailing zero. Quote version-like values in `values.yaml` itself (`tag: "1.20"`), and pipe template output through `| quote` when the source might not already be a string.

## The task

Write a `templates/deployment.yaml` that:

- Sets `metadata.name` to `{{ .Release.Name }}-webapp`
- Sets `metadata.labels` with `app.kubernetes.io/name: {{ .Chart.Name }}` and `app.kubernetes.io/instance: {{ .Release.Name }}`
- Sets `spec.replicas` from `.Values.replicaCount` with a default of `1`
- Sets the container image as `{{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}`
- Sets `imagePullPolicy` from `.Values.image.pullPolicy` with a default of `"IfNotPresent"`
- Sets `containerPort` from `.Values.service.port` with a default of `80`

For example, given this `values.yaml`:

```yaml
replicaCount: 3
image:
  repository: myregistry/app
  tag: "2.1.0"
  pullPolicy: Always
service:
  port: 8080
```

and a release installed as `helm install myrelease ./webapp`, the rendered manifest should contain:

```yaml
metadata:
  name: myrelease-webapp
  labels:
    app.kubernetes.io/name: webapp
    app.kubernetes.io/instance: myrelease
spec:
  replicas: 3
  ...
      containers:
        - name: webapp
          image: myregistry/app:2.1.0
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 8080
```

But if `image.tag`, `image.pullPolicy`, and `service.port` are all omitted from `values.yaml`, the same template must still render valid YAML using the stated defaults (`"latest"`, `"IfNotPresent"`, `80`) instead of leaving those fields blank.
