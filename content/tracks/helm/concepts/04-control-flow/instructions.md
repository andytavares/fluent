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

## Watch out

- **`with` rebinds `.` — including `.Release` and `.Values`.** Inside `{{- with .Values.resources }}`, `.` refers to the resources map, so `.Release.Name` no longer works (there's no `Release` key inside `resources`). Use `$.Release.Name` — `$` always refers to the root context, regardless of how many `with`/`range` blocks you're nested inside.
- **`with` treats an empty map as falsy, `if` does too.** `resources: {}` in `values.yaml` skips a `{{- with .Values.resources }}` block, same as if the key were absent entirely — there's no way to distinguish "explicitly empty" from "not set" using `with`.
- **Forgetting `{{-}}` on `range`/`if`/`end` produces blank lines, not errors.** A template that ranges over an empty list without `{{- if .Values.env }}` guarding it still renders `env:` followed by nothing underneath — which is invalid YAML (a key with no value and no children is fine, but a key followed by a blank line and then a dedented sibling key is a different structure than intended). Always pair a `range` over a potentially-empty list with an outer `if` when the parent key (`env:`) should disappear entirely if there's nothing to range over.
- **Whitespace control is about the *tag*, not the content.** `{{- if X }}` strips the newline immediately before the tag; it does not touch whitespace inside the `if` block. If your rendered YAML has unwanted indentation inside a block, that's a content problem (fix the template's own indentation), not a whitespace-control problem.

## The task

Write a `templates/deployment.yaml` that uses control flow to:

1. **`if`**: Only add a `resources:` block if `.Values.resources` is non-empty, using `{{- with .Values.resources }}`
2. **`if/else`**: Set `imagePullPolicy` — use `.Values.image.pullPolicy` if set, else `"IfNotPresent"`
3. **`range`**: Render the `env:` section by ranging over `.Values.env` (each item has `.name` and `.value`), skipping the entire `env:` block with `{{- if .Values.env }}` if the list is empty
4. **`if`**: Conditionally include a `livenessProbe` block only if `.Values.livenessProbe.enabled` is true
5. Use `{{-` whitespace control on all control-flow tags to avoid spurious blank lines

For example, with this `values.yaml`:

```yaml
image:
  repository: myregistry/webapp
  tag: "2.1.0"
env:
  - name: LOG_LEVEL
    value: debug
resources:
  limits:
    cpu: "500m"
livenessProbe:
  enabled: true
  path: /healthz
  port: 8080
  initialDelaySeconds: 5
```

the container spec renders as:

```yaml
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
```

But with a minimal `values.yaml` that only sets `image.repository` and `image.tag` (no `env`, `resources`, or `livenessProbe`), the same template must still render valid YAML with **no `env:` key, no `resources:` key, and no `livenessProbe:` key at all** — those keys must vanish entirely rather than render as empty.
