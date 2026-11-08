## What you build

You write a `NOTES.txt` that tells the operator how to reach the app, and a `values.schema.json` that rejects bad values before Helm renders. This lesson builds on **Chart Tests**.

## Key concepts

### Four patterns make a chart ready for production

Demo charts skip them: `NOTES.txt` for guidance after install, `values.schema.json` for input validation, `lookup` for cluster-aware rendering and rollback on a failed upgrade.

### `NOTES.txt` prints the next steps

Helm prints `templates/NOTES.txt` after each successful `helm install` or `helm upgrade`. It is a Go template, like your other templates. It tells the operator what to do next: the service URL, useful commands and manual steps.

```
Your {{ .Chart.Name }} deployment is
complete.

  Release:   {{ .Release.Name }}
  Namespace: {{ .Release.Namespace }}
  Version:   {{ .Chart.AppVersion }}
{{- $ns := .Release.Namespace }}
{{- $svc := printf "%s-webapp"
      .Release.Name }}
{{- if eq .Values.service.type
      "LoadBalancer" }}
Get the external IP:
  kubectl get svc -n {{ $ns }} \
    {{ $svc }} -w
{{- else if eq .Values.service.type
      "NodePort" }}
  export NODE_PORT=$(kubectl get svc \
    -n {{ $ns }} {{ $svc }} -o \
    jsonpath="{.spec.ports[0].nodePort}")
  echo "Visit http://$NODE_IP:$NODE_PORT"
{{- else }}
  kubectl port-forward svc/{{ $svc }} \
    8080:{{ .Values.service.port }}
  echo "Visit http://127.0.0.1:8080"
{{- end }}
```

### `values.schema.json` validates the values

`values.schema.json` is a JSON Schema file in the chart root. Its `"$schema"` field names the JSON Schema draft, for example `http://json-schema.org/draft-07/schema#`. Helm validates the merged values against the schema before it renders any template. Operator mistakes then show at install time, not at pod creation or at runtime. Schema validation runs before `required` in templates, which is a better experience than a failure in the middle of the render.

```json
{
  "type": "object",
  "required": ["image"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1
    },
    "image": {
      "type": "object",
      "required": ["repository"],
      "properties": {
        "repository": { "type": "string" },
        "tag": { "type": "string" },
        "pullPolicy": {
          "type": "string",
          "enum": [
            "Always",
            "IfNotPresent",
            "Never"
          ]
        }
      }
    }
  }
}
```

### `lookup` reads the live cluster during the render

`lookup` returns the object if it exists, or an empty map if not. Its main use: keep an existing Secret, so an upgrade does not rotate the credentials.

```yaml
{{- $name := printf "%s-api-key"
      .Release.Name }}
{{- $existing := lookup "v1" "Secret"
      .Release.Namespace $name }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ $name }}
type: Opaque
data:
  {{- if $existing }}
  api-key: {{ index $existing.data
    "api-key" }}
  {{- else }}
  api-key: {{ randAlphaNum 32 | b64enc
    | quote }}
  {{- end }}
```

`helm template` and `--dry-run` do not contact the cluster, so `lookup` returns an empty map. Your template must handle that case.

### Roll back a failed upgrade automatically

Without a rollback flag, a failed upgrade leaves the release in the `failed` state, and you must fix it by hand. With the flag, Helm rolls back to the last good revision on any failure. Helm 3 calls the flag `--atomic`. Helm 4 renames it to `--rollback-on-failure`.

```bash
# Helm 4; use --atomic on Helm 3
helm upgrade --install myapp ./chart \
  --rollback-on-failure \
  --timeout 5m \
  --cleanup-on-fail \
  -f production-values.yaml
```

`--cleanup-on-fail` deletes the resources that the failed upgrade created. Orphaned resources then do not stay in the namespace.

### Other tools

Terraform `output` blocks do a job like `NOTES.txt`, and Terraform variable `validation` blocks are like `values.schema.json`, but in HCL. Kustomize is a pure function of its inputs. `lookup` makes Helm stateful, so `helm template` and `--dry-run` can behave differently from the real upgrade and hide bugs until deployment.

## Watch out

- Helm renders `NOTES.txt` as plain text, not as YAML.
- A template error in `NOTES.txt`, like an unclosed `{{ if }}`, fails the whole release.
- No linter finds a logic mistake in `NOTES.txt`, like wrong wording. Read it in `helm install --dry-run --debug`.
- `values.schema.json` validates the merged values, after all `-f` files and `--set` flags.
- An override that breaks the schema fails at install time with a JSON Schema error, before any template renders.
- JSON Schema allows fields that are not in `properties`. Add `"additionalProperties": false` to reject unknown fields.
- A field that the schema does not list gets no validation.
- `lookup` returns an empty map when it finds nothing, so `{{- if $existing }}` treats "not found" as false.
- Reading `$existing.data` on a lookup that found nothing fails the render. Always put the access inside the `if`.

## The task

Write `templates/NOTES.txt`, a `---` line, then `values.schema.json` in `stub.yaml`.

1. `NOTES.txt` shows `.Release.Name`, `.Release.Namespace` and `.Chart.AppVersion`.
2. Use `{{- if eq .Values.service.type "LoadBalancer" }}`, `{{- else }}` and `{{- end }}`.
3. The `LoadBalancer` branch shows a `kubectl get svc ... -w` command.
4. The `else` branch shows a `kubectl port-forward` command that uses `.Values.service.port`.
5. The schema has a `"$schema"` field with a `json-schema.org` URL and `"type": "object"`.
6. `replicaCount` is an `"integer"` with `"minimum": 1`.
7. The top level requires `image`: `"required": ["image"]`.
8. `image` is an object that requires the string property `repository`.
9. `image.pullPolicy` has the enum `"Always"`, `"IfNotPresent"`, `"Never"`.
10. `service.type` has the enum `"ClusterIP"`, `"NodePort"`, `"LoadBalancer"`.
11. `service.port` is an `"integer"` with `"minimum": 1` and `"maximum": 65535`.
12. Remove every `TODO` comment.

The schema rejects `replicaCount: 0`, `image: {}`, `pullPolicy: "Sometimes"` and `service.port: 70000`. It accepts all values in the bounds.

```
# helm install myapp ./webapp -n staging
# appVersion "2.3.1",
# service.type ClusterIP, service.port 8080
webapp 2.3.1 is deployed.

  Release:   myapp
  Namespace: staging
  Version:   2.3.1

Access the application via port-forward:
  kubectl port-forward -n staging \
    svc/myapp-webapp 8080:8080
  echo "Visit http://127.0.0.1:8080"

# With service.type LoadBalancer, the
# kubectl get svc -w command shows instead,
# and no port-forward line.
```
