## What you build

You write a database migration Job that Helm runs before each install and upgrade. The Job fails fast and renders only when migrations are on. This lesson builds on **Functions & Pipelines**.

## Key concepts

### A hook runs at a point in the release lifecycle

Hooks run Kubernetes Jobs or other resources before install, after upgrade, before delete and at other points. You use them for database migrations, pre-flight checks and cleanup scripts.

### A hook is a resource with the `helm.sh/hook` annotation

Helm takes these resources out of the normal manifest set. It runs them at the lifecycle point that the annotation names. Helm does not track hook resources as part of the release.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-db-migrate
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": >-
      before-hook-creation,hook-succeeded
```

### The `helm.sh/hook` value sets the phase

| Value | When it runs |
|---|---|
| `pre-install` | After render, before Helm creates resources |
| `post-install` | After Helm loads all resources into Kubernetes |
| `pre-upgrade` | Before the upgrade starts |
| `post-upgrade` | After the upgrade completes |
| `pre-delete` | Before `helm uninstall` deletes anything |
| `post-delete` | After Helm deletes all resources |
| `pre-rollback` | Before the rollback starts |
| `post-rollback` | After the rollback completes |
| `test` | On `helm test`; see the Chart Tests concept |

A list of phases runs the hook at each one: `"helm.sh/hook": pre-install,pre-upgrade`.

### `helm.sh/hook-weight` sets the order

Helm sorts hooks of the same phase by weight, from low to high, then by name. Negative weights run first.

```yaml
# Runs first
"helm.sh/hook-weight": "-10"
# Runs second
"helm.sh/hook-weight": "0"
# Runs third
"helm.sh/hook-weight": "5"
```

### `helm.sh/hook-delete-policy` sets when Helm deletes the hook

| Value | When Helm deletes the resource |
|---|---|
| `before-hook-creation` | Before it creates the hook again. This stops name collisions on re-runs. |
| `hook-succeeded` | After the hook succeeds |
| `hook-failed` | After the hook fails. This destroys the logs, so use it with care. |

With no policy annotation, `before-hook-creation` applies. Production charts use `before-hook-creation,hook-succeeded` in most cases. Failed hooks stay for debugging, and successful hooks go away.

### Helm waits for hook Jobs

Helm waits for a hook Job to complete. If a pre-install hook Job fails, the install fails. `backoffLimit` sets the retries, and `activeDeadlineSeconds` sets the timeout. Set them explicitly.

```yaml
spec:
  # Fail fast: no retries for migrations
  backoffLimit: 0
  # Time out after 5 minutes
  activeDeadlineSeconds: 300
  template:
    spec:
      # Required for Jobs used as hooks
      restartPolicy: Never
```

### Other tools have no Helm hooks

With raw manifests or Kustomize, you order steps yourself with init containers, readiness gates or CI steps. Argo CD has its own hooks (`argocd.argoproj.io/hook`), modeled on Helm hooks, and they take precedence for sync-time operations.

## Watch out

- `helm uninstall` does not delete hook resources. Helm does not track them in the release.
- `helm list` and `helm get manifest` do not show hook resources.
- Put `helm.sh/hook` under `metadata.annotations`, never under `metadata.labels`.
- Under `labels`, Kubernetes accepts the key with no error. Helm ignores it, and the Job runs as a normal resource.
- With no `backoffLimit`, Kubernetes retries a failed Job pod 6 times.
- A high `backoffLimit` keeps a failing hook running for a long time.
- `backoffLimit: 0` fails the hook and the install after one failure. Use it for a migration.
- Hooks of the same phase with no weight run in name order. That order breaks when someone renames a resource.
- Set `helm.sh/hook-weight` on each hook whose order matters.

## The task

Write `templates/pre-install-job.yaml` in `stub.yaml`. It is a database migration hook.

1. Make it a `batch/v1` Job named `{{ .Release.Name }}-db-migrate`.
2. Put the hook annotations under `metadata.annotations`.
3. Set `"helm.sh/hook": pre-install,pre-upgrade`.
4. Set `"helm.sh/hook-weight": "-5"`, so it runs before other hooks of the same phase.
5. Set `"helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded`.
6. Set `backoffLimit: 0` and `activeDeadlineSeconds: 120`.
7. Set `restartPolicy: Never` on the pod spec.
8. Set the container image to `{{ .Values.migrations.image }}`.
9. Keep the command `["sh", "-c", "python manage.py migrate"]`.
10. Wrap the whole template in `{{- if .Values.migrations.enabled }}` and `{{- end }}`.
11. Remove every `TODO` comment.

If `migrations.enabled` is false or not set, the template renders nothing: no `apiVersion`, no `kind`.

```yaml
# helm install myapp ./webapp with
# migrations.enabled: true and
# migrations.image: myregistry/webapp:2.1.0
apiVersion: batch/v1
kind: Job
metadata:
  name: myapp-db-migrate
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  backoffLimit: 0
  activeDeadlineSeconds: 120
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: myregistry/webapp:2.1.0
          command: ["sh", "-c", "python manage.py migrate"]
```
