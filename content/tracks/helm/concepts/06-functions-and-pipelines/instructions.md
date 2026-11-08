## What you build

You write a Secret template that builds its name with `printf`, fails on missing credentials with `required` and encodes data with `b64enc`. This lesson builds on **Named Templates**.

## Key concepts

### Helm has Go and Sprig functions

Helm templates have the Go built-in template functions and the [Sprig](http://masterminds.github.io/sprig/) library, with more than 70 more functions. This lesson covers the functions that real charts use most.

### `|` chains functions from left to right

The pipe passes the output of each function as the last argument of the next one. It replaces deeply nested function calls.

```yaml
{{ .Values.image.tag
   | default "latest" | quote }}
```

This takes `.Values.image.tag` and gives it to `default "latest"`, which returns `"latest"` for a false value. Then `quote` puts the result in double quotes.

### String functions change text

```yaml
# Input: "my-app"
# "MY-APP"
{{ .Values.name | upper }}
# "my-app"
{{ .Values.name | lower }}
# "My-App"
{{ .Values.name | title }}
# "my_app"
{{ .Values.name | replace "-" "_" }}
# Cut to 63 chars, no trailing "-"
{{ .Values.name | trunc 63
   | trimSuffix "-" }}
# "my-app" with the quotes: use for
# string values in YAML
{{ .Values.name | quote }}
# Base64, for Secrets
{{ .Values.name | b64enc }}
```

### `indent` and `nindent` format blocks

`indent N` adds N spaces to every line. `nindent N` adds a newline first. Use `nindent` after `{{-`.

```yaml
data:
  config: |
    {{- .Files.Get "app.conf"
        | nindent 4 }}

spec:
  {{- toYaml .Values.affinity
      | nindent 2 }}
```

### `toYaml` passes structured values through

`toYaml` turns a Go value into a YAML string, and `fromYaml` does the reverse. With `toYaml`, the operator can put any `resources:` map in the values file. The chart author does not hardcode every field.

```yaml
resources:
  {{- toYaml .Values.resources
      | nindent 2 }}
```

### `required` stops the render on a missing value

Use `required` for values that have no good default. The error shows at `helm install` time, not at pod start.

```yaml
image: {{ required
  "image.repository is required"
  .Values.image.repository }}
```

### `tpl` renders a string as a template

`tpl` lets the operator put template expressions in values files. That is powerful, but it makes charts harder to read, so use it rarely. It is the right tool when a value from an external configuration needs the release name.

```yaml
# values.yaml
fullnameOverride: "{{ .Release.Name }}-x"

# template
name: {{ tpl .Values.fullnameOverride . }}
```

### `lookup` reads the live cluster

The Production Patterns concept covers `lookup`.

```yaml
{{- $secret := lookup "v1" "Secret"
    .Release.Namespace "my-secret" -}}
```

### Helm functions fail at render time

Terraform functions run on typed values in a type-safe language, while Kustomize has no functions. In Helm, a type error, like `upper` on an integer, fails the render with an unclear error.

## Watch out

- `required` checks only for a missing or empty value. It does not check the type or the format.
- `required` passes any non-empty `db.host`, with a typo or not. Add `values.schema.json` for real validation.
- `b64enc` and `upper` take a string. An integer fails with `wrong type for value; expected string`.
- YAML reads an unquoted `password: 12345` as a number. Quote it in `values.yaml`.
- Pipe through `toString` when you cannot be sure the source value is a string.
- A map or a list has no string form, so `b64enc` fails on it.
- The pipeline reads left to right. A nested call reads inside out.
- `.Values.db.name | default "appdb" | b64enc | quote` equals `quote (b64enc (default "appdb" .Values.db.name))`. Real charts use the pipeline form.

## The task

Write `templates/secret.yaml` in `stub.yaml`. The Secret holds database credentials. It keeps `type: Opaque`.

1. Set `metadata.name` to `printf "%s-db-credentials" .Release.Name | trunc 63 | trimSuffix "-"`.
2. Set `metadata.namespace` to `{{ .Release.Namespace }}`.
3. Set the label `environment` to `.Values.global.env | default "production" | lower`.
4. Set `DB_HOST` to `required "db.host is required" .Values.db.host | b64enc`.
5. Set `DB_PASSWORD` to `required "db.password is required" .Values.db.password | b64enc`.
6. Set `DB_NAME` to `.Values.db.name | default "appdb" | b64enc | quote`.
7. Remove every `TODO` comment.

`db.name` is optional and falls back to `appdb`. If `db.host` or `db.password` is missing, the render fails with the `required` message. The label is lowercase for any input case.

```yaml
# Release myapp. Values: db.host
# "db.internal", db.password "s3cr3t",
# global.env "PRODUCTION". No db.name.
apiVersion: v1
kind: Secret
metadata:
  name: myapp-db-credentials
  namespace: <release namespace>
  labels:
    environment: production
type: Opaque
data:
  # base64 of "db.internal"
  DB_HOST: ZGIuaW50ZXJuYWw=
  # base64 of "s3cr3t"
  DB_PASSWORD: czNjcjN0
  # base64 of "appdb"
  DB_NAME: "YXBwZGI="

# No db.host: the render fails with
# db.host is required
```
