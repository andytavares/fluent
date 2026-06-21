# Hooks

## What you'll learn

Helm hooks let you run Kubernetes Jobs (or other resources) at specific points in the release lifecycle — before install, after upgrade, before delete, etc. They're how you implement database migrations, pre-flight checks, cleanup scripts, and anything else that needs to run in a specific sequence relative to your main workloads.

## Key concepts

**How hooks work** — a hook is any Kubernetes resource annotated with `helm.sh/hook`. Helm separates these resources from the normal manifest rendering pipeline and runs them at the specified lifecycle point. Hook resources are **not** managed by Helm's standard upgrade/rollback logic unless you also add a delete policy.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-db-migrate
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

**Hook types** — the value of `helm.sh/hook`:

| Value | When it runs |
|---|---|
| `pre-install` | After templates rendered, before any resources created |
| `post-install` | After all resources created and ready |
| `pre-upgrade` | Before upgrade starts |
| `post-upgrade` | After upgrade completes |
| `pre-delete` | Before `helm uninstall` deletes anything |
| `post-delete` | After all resources deleted |
| `pre-rollback` | Before rollback starts |
| `post-rollback` | After rollback completes |
| `test` | When `helm test` is run (covered in concept 09) |

You can list multiple phases: `"helm.sh/hook": pre-install,pre-upgrade` — the hook runs at both points.

**`helm.sh/hook-weight`** — controls execution order when multiple hooks run at the same phase. Hooks are sorted by weight (ascending), then alphabetically by name. Negative weights run first.

```yaml
"helm.sh/hook-weight": "-10"   # runs first
"helm.sh/hook-weight": "0"     # runs second
"helm.sh/hook-weight": "5"     # runs third
```

**`helm.sh/hook-delete-policy`** — controls when Helm deletes the hook resource after it runs:

| Value | When deleted |
|---|---|
| `before-hook-creation` | Delete old hook resource before creating a new one (prevents collision on re-runs) |
| `hook-succeeded` | Delete if the hook Job completes successfully |
| `hook-failed` | Delete if the hook Job fails (use carefully — destroys logs) |

The production combination is almost always: `before-hook-creation,hook-succeeded`. This keeps failed hooks around for debugging while cleaning up successful ones.

**Waiting for hooks** — Helm waits for Jobs to complete before proceeding. If a pre-install hook Job fails, the install fails. The Job's `backoffLimit` and `activeDeadlineSeconds` control retry and timeout behavior — set them explicitly or a failed migration retries forever.

```yaml
spec:
  backoffLimit: 0             # fail fast, don't retry migrations
  activeDeadlineSeconds: 300  # timeout after 5 minutes
  template:
    spec:
      restartPolicy: Never    # required for Jobs used as hooks
```

## vs other tools

Raw Kubernetes manifests have no concept of ordered lifecycle operations — you `kubectl apply` everything and manage sequencing yourself (init containers, readiness gates, separate CI steps). Kustomize similarly has no hook mechanism. Argo CD has hooks as a separate concept (`argocd.argoproj.io/hook`), modeled after Helm's but cluster-managed. If you're using Argo CD with Helm, Argo CD's hooks take precedence for sync-time operations.

## The task

Write a `templates/pre-install-job.yaml` for a database migration hook that:

- Is a `batch/v1 Job` named `{{ .Release.Name }}-db-migrate`
- Runs at both `pre-install` and `pre-upgrade` phases
- Has hook weight `-5` (so it runs before other hooks at the same phase)
- Has delete policy `before-hook-creation,hook-succeeded`
- Sets `backoffLimit: 0` and `activeDeadlineSeconds: 120`
- Has `restartPolicy: Never` on the pod spec
- Uses image `{{ .Values.migrations.image }}` with the command `["sh", "-c", "python manage.py migrate"]`
- Only renders this Job if `.Values.migrations.enabled` is true (wrap the whole template in `{{- if .Values.migrations.enabled }}`)
