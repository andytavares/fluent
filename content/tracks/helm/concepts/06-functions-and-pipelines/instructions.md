# Functions & Pipelines

## What you'll learn

Helm templates have access to Go's built-in template functions plus the entire [Sprig](http://masterminds.github.io/sprig/) library — over 70 additional functions. The pipeline operator `|` chains them left-to-right, passing the output of each function as the last argument to the next. This concept covers the functions you'll use in every real chart.

## Key concepts

**The pipeline `|`**

```yaml
{{ .Values.image.tag | default "latest" | quote }}
```

Reads left to right: take `.Values.image.tag`, pass it to `default "latest"` (returns `"latest"` if the value is falsy), then pass the result to `quote` (wraps in double quotes). The pipeline replaces the need for deeply nested function calls.

**String functions:**

```yaml
{{ .Values.name | upper }}          # "MYAPP"
{{ .Values.name | lower }}          # "myapp"
{{ .Values.name | title }}          # "Myapp"
{{ .Values.name | replace "-" "_" }} # "my_app"
{{ .Values.name | trunc 63 | trimSuffix "-" }}  # truncate safely
{{ .Values.name | quote }}          # "myapp"  — always use for string values in YAML
{{ .Values.name | b64enc }}         # base64 encode (useful for Secrets)
```

**`indent` and `nindent`** — the most-used formatting functions:

```yaml
# indent N — adds N spaces to every line (no leading newline)
data:
  config: |
    {{ .Files.Get "app.conf" | indent 4 }}

# nindent N — prepends a newline then indents (correct after {{-)
spec:
  {{- toYaml .Values.affinity | nindent 2 }}
```

**`toYaml` and `fromYaml`** — serialize/deserialize Go values to/from YAML strings. `toYaml` is essential for passing arbitrary structured values through templates:

```yaml
resources:
  {{- toYaml .Values.resources | nindent 2 }}
```

This pattern lets operators put an arbitrary `resources:` map in their values file without the chart author hardcoding every possible field.

**`required`** — fails the render with a clear message if a value is missing:

```yaml
image: {{ required "image.repository is required" .Values.image.repository }}
```

Use `required` on values that have no sensible default and must be set by the operator. The error message surfaces at `helm install` time, not at pod start.

**`tpl`** — renders a string as a template (double-evaluation):

```yaml
# values.yaml
fullnameOverride: "{{ .Release.Name }}-custom"

# template
name: {{ tpl .Values.fullnameOverride . }}
```

Use `tpl` sparingly — it lets operators embed template expressions in values files, which is powerful but makes charts harder to reason about. It's the right tool when you need the release name inside a value that comes from an external config.

**`lookup`** — queries the live cluster state (covered in production patterns):

```yaml
{{- $secret := lookup "v1" "Secret" .Release.Namespace "my-secret" -}}
```

## vs other tools

Terraform has built-in functions (`format`, `toset`, `merge`, etc.) and a similar pipeline feeling via function composition. The difference is that Helm functions operate on the string output of templates, while Terraform functions operate on typed values in a type-safe expression language. In Helm, type errors (like calling `upper` on an integer) fail at render time with opaque errors — use `| toString` to coerce before piping to string functions.

Kustomize has no functions. Period.

## The task

Write a `templates/secret.yaml` that demonstrates the key functions:

1. `metadata.name`: use `printf` to combine `.Release.Name` and `"db-credentials"`, then pipe through `trunc 63 | trimSuffix "-"`
2. `metadata.namespace`: use `.Release.Namespace`
3. In `data`, store a `DB_HOST` key: take `.Values.db.host`, use `required` with the message `"db.host is required"`, then `b64enc`
4. Store a `DB_PASSWORD` key: take `.Values.db.password`, use `required "db.password is required"`, then `b64enc`
5. Store a `DB_NAME` key: take `.Values.db.name | default "appdb"` then `b64enc | quote`
6. In `metadata.labels`, apply a label `environment` set to `.Values.global.env | default "production" | lower`
