## What you build

You write a Deployment template that reads its name, labels, replica count, image and port from values and release data. Each optional value has a safe default. This lesson builds on **Chart Structure**.

## Key concepts

### `{{ }}` marks a template expression

Helm templates are Kubernetes YAML with Go `text/template` syntax inside. Helm replaces each `{{ ... }}` expression before it sends the manifest to the API server. Helm copies all text outside the braces as it is.

```yaml
metadata:
  # Renders as: myrelease-webapp
  name: {{ .Release.Name }}-webapp
```

### `.Values` is a path into `values.yaml`

Each dot goes one level down the values tree.

```yaml
# values.yaml
image:
  repository: myregistry/app
  tag: "1.0.0"
```

```yaml
# Template: renders myregistry/app
repo: {{ .Values.image.repository }}
# Template: renders 1.0.0
tag: {{ .Values.image.tag }}
```

### `.Release.Name` and `.Chart.Name` make names unique

Put the release name in each resource name. Then two releases in the same namespace do not collide.

```yaml
# metadata.name
name: {{ .Release.Name }}-{{ .Chart.Name }}
# metadata.labels
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
```

### `default` gives a fallback value

`default` is a function from Sprig, the template library that Helm adds. `{{ .Values.x | default "fallback" }}` renders `.Values.x`, or `"fallback"` when the value is empty, zero or not set. The operator then does not have to set every value.

```yaml
replicas: {{ .Values.replicaCount | default 1 }}
```

### `quote` keeps a value a string

Pipe a value through `quote` when it looks like a number but must stay a string.

```yaml
annotations:
  # YAML reads an unquoted 1.0 as a float
  version: {{ .Values.appVersion | quote }}
```

### Go templates keep the value types

Helm templates are Go `text/template`, not Jinja2, ERB or Mustache. A map in `values.yaml` stays a Go map in the template, so you can range over it, check its length and pass it to functions. Sprig adds about 70 functions to the Go built-in functions. If an expression does not work, check if you need a Sprig function.

## Watch out

- A missing leaf key does not cause an error. It renders as `<no value>` or as an empty string.
- `{{ .Values.image.tag }}` with no `tag` key renders `image: myregistry/app:`. Helm renders it without an error. The pod then fails with `InvalidImageName`.
- Pair each value that can be absent with `default` or with `required "message"`.
- A missing parent map stops the render. If `.Values.image` does not exist, `.Values.image.repository` fails with `nil pointer evaluating interface {}.repository`.
- Give each nested object a placeholder in `values.yaml`, for example `image: {}`. Then templates can read one level deeper.
- `default` treats zero values as not set. `replicaCount: 0` with `default 1` renders `1`.
- `0`, `""` and `false` are all false in Go templates. To find an explicit zero, use `{{- if hasKey .Values "replicaCount" }}`.
- YAML reads `tag: 1.20` as the float `1.2` and drops the zero. Write `tag: "1.20"` in `values.yaml`.
- Pipe template output through `quote` when the source value is not always a string.

## The task

Write `templates/deployment.yaml` in `stub.yaml`. The Deployment reads its fields from values and from release data.

1. Set `metadata.name` to `{{ .Release.Name }}-webapp`.
2. Set the label `app.kubernetes.io/name` to `{{ .Chart.Name }}`.
3. Set the label `app.kubernetes.io/instance` to `{{ .Release.Name }}`.
4. Set `spec.replicas` to `{{ .Values.replicaCount | default 1 }}`.
5. Set the container `image` to `{{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}`.
6. Set `imagePullPolicy` to `.Values.image.pullPolicy`, with the default `"IfNotPresent"`.
7. Set `containerPort` to `.Values.service.port`, with the default `80`.
8. Remove every `TODO` comment.

If `image.tag`, `image.pullPolicy` and `service.port` are not set, the template renders `latest`, `IfNotPresent` and `80`. It does not leave those fields empty.

```yaml
# Template lines
name: {{ .Release.Name }}-webapp
replicas: {{ .Values.replicaCount | default 1 }}
image: {{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}
imagePullPolicy: {{ .Values.image.pullPolicy | default "IfNotPresent" }}
containerPort: {{ .Values.service.port | default 80 }}

# helm install myrelease ./webapp
# with replicaCount: 3, tag: "2.1.0",
# pullPolicy: Always, service.port: 8080
name: myrelease-webapp
replicas: 3
image: myregistry/app:2.1.0
imagePullPolicy: Always
containerPort: 8080

# With tag, pullPolicy and port not set
image: myregistry/app:latest
imagePullPolicy: IfNotPresent
containerPort: 80
```
