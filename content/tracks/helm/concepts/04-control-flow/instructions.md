## What you build

You write a Deployment template with `if`/`else`, `range` and `with` blocks. Optional blocks vanish when their values are not set. This lesson builds on **Built-in Objects**.

## Key concepts

### `if`, `else` and `end` choose a block

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-ingress
{{- end }}
```

### Some values are false

`false`, `0`, `""`, `nil`, an empty slice and an empty map are false. All other values are true. The string `"false"` is not empty, so it is true.

### `-` removes whitespace next to a tag

Go templates have `if`/`else`, `range` and `with`. Helm templates use the `-` in `{{-` and `-}}` to control whitespace. Without it, the rendered YAML gets blank lines around your logic. Blank lines are mostly harmless, but they make debugging and diffs confusing.

| Syntax | Effect |
|---|---|
| `{{ expr }}` | Removes no whitespace |
| `{{- expr }}` | Removes whitespace before the tag |
| `{{ expr -}}` | Removes whitespace after the tag |
| `{{- expr -}}` | Removes both sides |

### `range` loops over a slice or a map

Inside `range`, `.` is the current item.

```yaml
# values.yaml
env:
  - name: LOG_LEVEL
    value: debug
  - name: PORT
    value: "8080"
```

```yaml
env:
{{- range .Values.env }}
  - name: {{ .name }}
    value: {{ .value | quote }}
{{- end }}
```

### `$` is always the root

Use `$` to read the root inside a loop, for example `$.Release.Name`.

```yaml
{{- range .Values.sidecars }}
  - name: {{ $.Release.Name }}-{{ .name }}
{{- end }}
```

### `with` sets `.` and skips false values

`with` sets `.` to a value. If the value is false, Helm skips the block. Inside the block, you write `.` and not the full path again.

```yaml
{{- with .Values.resources }}
resources:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

### Kustomize has no control flow

Kustomize cannot include a resource based on a value, so you use components or overlays in separate files. Control flow in one Helm template is powerful, and it causes most template bugs. If the logic grows large, split it into more template files.

## Watch out

- `with` changes `.`. Inside `{{- with .Values.resources }}`, `.Release.Name` does not work.
- Use `$.Release.Name` inside `with` and `range`. `$` is the root at every depth.
- `with` and `if` both treat an empty map as false. `resources: {}` skips the block, as an absent key does.
- `with` cannot tell an explicitly empty map from a missing key.
- A missing `-` on `range`, `if` or `end` gives blank lines, not errors.
- A `range` over an empty list still renders the parent `env:` key with nothing under it.
- Wrap that `range` in an outer `if` when the `env:` key must vanish.
- `{{- if X }}` removes the newline before the tag only. It does not change the whitespace inside the block.
- Bad indentation inside a block comes from the template content. Fix the indentation of the template lines.

## The task

Write `templates/deployment.yaml` in `stub.yaml`. Control flow keeps empty blocks out of the container spec.

1. Set `imagePullPolicy` with `{{- if .Values.image.pullPolicy }}`. Use the value when it is set, else `IfNotPresent`.
2. Wrap the `env:` block in `{{- if .Values.env }}`. Inside it, use `{{- range .Values.env }}`.
3. In the loop, render each item as `- name: {{ .name }}` and `value: {{ .value | quote }}`.
4. Render `resources:` inside `{{- with .Values.resources }}`. Use `{{- toYaml . | nindent 12 }}`, the indent of the container's fields.
5. Render `livenessProbe` inside `{{- if .Values.livenessProbe.enabled }}`.
6. The probe reads `.Values.livenessProbe.path`, `.Values.livenessProbe.port` and `.Values.livenessProbe.initialDelaySeconds`.
7. Use `{{-` on every `if`, `range`, `with` and `end` tag.
8. Remove every `TODO` comment.

With only `image.repository` and `image.tag` set, the output has no `env:`, `resources:` or `livenessProbe:` key.

```yaml
# Values: env LOG_LEVEL=debug,
# resources.limits.cpu "500m",
# livenessProbe enabled with path
# /healthz, port 8080 and
# initialDelaySeconds 5. No pullPolicy.
containers:
  - name: webapp
    image: myregistry/webapp:2.1.0
    imagePullPolicy: IfNotPresent
    env:
      - name: LOG_LEVEL
        value: "debug"
    resources:
      limits:
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 5

# Values: only image.repository and tag
containers:
  - name: webapp
    image: myregistry/webapp:2.1.0
    imagePullPolicy: IfNotPresent
```
