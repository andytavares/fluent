# Production Patterns

## What you'll learn

This concept covers four patterns that distinguish charts written for production use from charts that only work in demos: `NOTES.txt` for post-install guidance, `values.schema.json` for input validation, the `lookup` function for cluster-aware rendering, and `helm upgrade --atomic` for safe rollouts.

## Key concepts

**`NOTES.txt`** — printed to the terminal after every successful `helm install` or `helm upgrade`. It's a Go template (same syntax as your other templates), and its job is to tell the operator exactly what to do next — the service URL, relevant commands, any manual steps required.

```
{{/* templates/NOTES.txt */}}
Your {{ .Chart.Name }} deployment is complete.

  Release:   {{ .Release.Name }}
  Namespace: {{ .Release.Namespace }}
  Version:   {{ .Chart.AppVersion }}

{{- if eq .Values.service.type "LoadBalancer" }}
Get the external IP:
  kubectl get svc --namespace {{ .Release.Namespace }} {{ .Release.Name }}-webapp -w
{{- else if eq .Values.service.type "NodePort" }}
  export NODE_PORT=$(kubectl get svc --namespace {{ .Release.Namespace }} {{ .Release.Name }}-webapp -o jsonpath="{.spec.ports[0].nodePort}")
  echo "Visit http://$NODE_IP:$NODE_PORT"
{{- else }}
  kubectl port-forward svc/{{ .Release.Name }}-webapp 8080:{{ .Values.service.port }}
  echo "Visit http://127.0.0.1:8080"
{{- end }}
```

**`values.schema.json`** — a JSON Schema file placed at the chart root. Helm validates the merged values against this schema before rendering any templates. This catches operator mistakes at install time rather than at pod creation time (or worse, at runtime).

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
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
          "enum": ["Always", "IfNotPresent", "Never"]
        }
      }
    }
  }
}
```

Schema validation fires before `required` in templates — it's a better UX for operators than a mid-render failure.

**`lookup`** — queries live cluster state during rendering. Returns the object if it exists, or an empty dict if not. The primary use case: don't overwrite a Secret if it already exists (so you don't rotate credentials on every upgrade).

```yaml
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace (printf "%s-api-key" .Release.Name) -}}
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-api-key
type: Opaque
data:
  {{- if $existingSecret }}
  api-key: {{ index $existingSecret.data "api-key" }}
  {{- else }}
  api-key: {{ randAlphaNum 32 | b64enc | quote }}
  {{- end }}
```

`lookup` returns nil in `helm template` (offline) and during `--dry-run`. Design your templates to handle the nil case gracefully.

**`helm upgrade --atomic`** — rolls back automatically if the upgrade fails. Without `--atomic`, a failed upgrade leaves the release in a `failed` state that requires manual intervention. With it, Helm rolls back to the last good revision on any failure.

```bash
helm upgrade --install myapp ./chart \
  --atomic \
  --timeout 5m \
  --cleanup-on-fail \
  -f production-values.yaml
```

`--cleanup-on-fail` deletes newly-created resources if the rollback is triggered — prevents orphaned resources from polluting the namespace.

## vs other tools

`NOTES.txt` has no equivalent in Kustomize or raw manifests. Terraform has `output` blocks that serve a similar purpose. Schema validation in `values.schema.json` is comparable to Terraform variable `validation` blocks, but Helm's is JSON Schema while Terraform's is custom HCL expressions.

The `lookup` function makes Helm "stateful" in a way that Kustomize explicitly avoids — Kustomize is designed to be a pure function of inputs. The tradeoff: `helm template` (offline rendering) and `helm upgrade --dry-run` behave differently from the real upgrade when `lookup` is used, which can hide bugs until live deployment.

## The task

Write two files:

**`templates/NOTES.txt`** that:
- Shows the release name, namespace, and app version
- Has a conditional block: if `service.type` is `"LoadBalancer"`, show the `kubectl get svc -w` command; otherwise show the `kubectl port-forward` command with `service.port`

**`values.schema.json`** (a JSON Schema) that validates:
- `replicaCount` is an integer with a minimum of 1
- `image` is a required object with required string property `repository`
- `image.pullPolicy` (if present) must be one of `"Always"`, `"IfNotPresent"`, or `"Never"`
- `service.type` (if present) must be one of `"ClusterIP"`, `"NodePort"`, `"LoadBalancer"`
- `service.port` (if present) is an integer between 1 and 65535
