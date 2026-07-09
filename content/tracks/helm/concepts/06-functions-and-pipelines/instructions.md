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

## Watch out

- **`required` only guards against missing/empty values — it doesn't validate type or format.** `required "db.host is required" .Values.db.host` passes as long as `db.host` is any non-empty string; it won't catch a typo'd hostname. Combine with `values.schema.json` (covered in production patterns) for real validation.
- **`b64enc` operates on the string, not the YAML-decoded value.** `.Values.db.password | b64enc` encodes whatever string `password` holds — if `password: "12345"` was written unquoted and YAML parsed it as a number, piping a number into `b64enc` still works (Sprig coerces it to a string first), but a nested map or list passed to `b64enc` errors, because there's no sensible string form.
- **Pipeline order matters and reads left-to-right, but nesting reads inside-out.** `{{ .Values.db.name | default "appdb" | b64enc | quote }}` is *not* the same as `{{ quote (b64enc (default "appdb" .Values.db.name)) }}` written differently — they're the same computation, but the pipeline form is idiomatic Helm and the nested-call form is rare outside of Sprig's own docs. Prefer pipelines; they're what every real chart uses.
- **`toString` matters more than it looks.** Piping a Go `int` or `bool` value into a function that expects a string (like `upper` or `b64enc`) sometimes works because Sprig auto-converts, but relying on it is fragile across Sprig versions — pipe through `toString` explicitly when the source value's type isn't guaranteed to be a string.

## The task

Write a `templates/secret.yaml` that demonstrates the key functions:

1. `metadata.name`: use `printf` to combine `.Release.Name` and `"db-credentials"`, then pipe through `trunc 63 | trimSuffix "-"`
2. `metadata.namespace`: use `.Release.Namespace`
3. In `data`, store a `DB_HOST` key: take `.Values.db.host`, use `required` with the message `"db.host is required"`, then `b64enc`
4. Store a `DB_PASSWORD` key: take `.Values.db.password`, use `required "db.password is required"`, then `b64enc`
5. Store a `DB_NAME` key: take `.Values.db.name | default "appdb"` then `b64enc | quote`
6. In `metadata.labels`, apply a label `environment` set to `.Values.global.env | default "production" | lower`

For example, given a release named `myapp` and this `values.yaml`:

```yaml
db:
  host: "db.internal"
  password: "s3cr3t"
global:
  env: "PRODUCTION"
```

(note: `db.name` is intentionally omitted), the rendered Secret is:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-db-credentials
  namespace: <release namespace>
  labels:
    environment: production
type: Opaque
data:
  DB_HOST: ZGIuaW50ZXJuYWw=
  DB_PASSWORD: czNjcjN0
  DB_NAME: "YXBwZGI="
```

`DB_HOST` and `DB_PASSWORD` are the base64 encodings of `db.internal` and `s3cr3t`; `DB_NAME` falls back to `appdb` (base64: `YXBwZGI=`) because `db.name` wasn't set. `environment` is lowercased from `"PRODUCTION"` to `production` regardless of how the operator capitalized it in `values.yaml`. If `db.host` or `db.password` is missing entirely, the chart must fail to render with the exact `required` message rather than producing a Secret with an empty credential.
