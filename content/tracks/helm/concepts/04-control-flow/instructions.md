# Control Flow

## What you'll learn

Go templates have `if/else`, `range`, and `with` for control flow. The critical thing Helm adds on top is **whitespace control** — the `-` in `{{-` and `-}}` — which determines whether the template engine emits blank lines around your logic blocks. Get this wrong and you'll generate invalid YAML or confusing diffs.

## Key concepts

**`{{- if }} / {{- else }} / {{- end }}`**

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-ingress
{{- end }}
```

The leading `{{-` strips the newline *before* the tag. The trailing `-}}` strips the newline *after*. Without them, you get blank lines in the rendered YAML — usually harmless, but ugly and sometimes confusing when debugging.

Falsy values in Go templates: `false`, `0`, `""`, `nil`, empty slice, empty map. Everything else is truthy. This matches what you'd expect, but note that `"false"` (a non-empty string) is **truthy**.

**`{{- range }}`** — iterate over slices and maps:

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

Inside `range`, `.` is rebound to the current element. Use `$` to access the root scope when you need `.Release.Name` inside a loop:

```yaml
{{- range .Values.sidecars }}
  - name: {{ $.Release.Name }}-{{ .name }}
{{- end }}
```

**`{{- with }}`** — scope the dot to a value, and skip the block entirely if the value is falsy:

```yaml
{{- with .Values.resources }}
resources:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

`with` is cleaner than `if .Values.resources` followed by using `.Values.resources` inside the block — you can just use `.` inside `with`.

**Whitespace reference:**

| Syntax | Effect |
|---|---|
| `{{ expr }}` | No whitespace stripping |
| `{{- expr }}` | Strip whitespace/newline *before* this tag |
| `{{ expr -}}` | Strip whitespace/newline *after* this tag |
| `{{- expr -}}` | Strip both sides |

## vs other tools

Kustomize has no control flow — you cannot conditionally include a resource based on a value. You use components or overlays, which are separate files. Helm's `if/range/with` let a single template file generate different Kubernetes objects depending on values, which is both its power and the source of most template bugs. If your template logic gets complex, that's often a sign you should split into multiple template files.

## The task

Write a `templates/deployment.yaml` that uses control flow to:

1. **`if`**: Only add a `resources:` block if `.Values.resources` is non-empty, using `{{- with .Values.resources }}`
2. **`if/else`**: Set `imagePullPolicy` — use `.Values.image.pullPolicy` if set, else `"IfNotPresent"`
3. **`range`**: Render the `env:` section by ranging over `.Values.env` (each item has `.name` and `.value`), skipping the entire `env:` block with `{{- if .Values.env }}` if the list is empty
4. **`if`**: Conditionally include a `livenessProbe` block only if `.Values.livenessProbe.enabled` is true
5. Use `{{-` whitespace control on all control-flow tags to avoid spurious blank lines
