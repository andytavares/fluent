# Chart Tests

## What you'll learn

`helm test` runs a set of Pods that verify a release is functioning correctly after install. These are not unit tests of your templates — they're integration tests that run against live Kubernetes resources in a real (or local) cluster. They're the difference between "helm install reported success" and "the application is actually answering requests."

## Key concepts

**What a test is** — any Pod template annotated with `helm.sh/hook: test`. When you run `helm test <release-name>`, Helm creates the Pod, waits for it to complete, and reports success or failure based on the container's exit code.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ .Release.Name }}-test-connection
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  restartPolicy: Never
  containers:
    - name: wget
      image: busybox
      command: ['wget']
      args: ['--spider', 'http://{{ .Release.Name }}-webapp:{{ .Values.service.port }}']
```

**Convention: `templates/tests/` subdirectory** — test templates should live in `templates/tests/` to keep them separate from main resources. Helm renders everything in `templates/` regardless of subdirectory, so this is organizational only.

**`helm.sh/hook-delete-policy: before-hook-creation`** — without this, re-running `helm test` fails because the Pod already exists. `before-hook-creation` deletes any existing test Pod before creating a new one. Unlike install hooks, you generally do *not* want `hook-succeeded` here — keeping the Pod around after success lets you inspect its logs.

**What to test** — write test containers that verify observable behavior, not internal implementation:

```yaml
# Good: tests that the service responds on the expected port
command: ['curl', '-sf', 'http://{{ .Release.Name }}-svc/health']

# Good: tests that a database connection works
command: ['psql', '-h', '{{ .Release.Name }}-postgresql', '-U', 'app', '-c', 'SELECT 1']

# Avoid: tests that just check a Pod is Running (kubectl does this already)
```

**Multiple test pods** — you can define several test Pods. Helm runs them all and aggregates results. Use `helm.sh/hook-weight` to control execution order if tests depend on each other.

**`helm test --logs`** — passes all container logs to stdout after the test run. Essential for debugging failures. Include informative output in your test containers (`echo "Testing connection to..."` before the actual check).

**Running tests in CI** — the pattern:

```bash
helm upgrade --install myapp ./chart -f ci-values.yaml --wait
helm test myapp --logs
```

`--wait` ensures all Deployments are ready before tests start. Without it, test pods may run before the app is serving traffic.

## vs other tools

Raw Kubernetes manifests have no built-in test mechanism. You'd write separate scripts or use tools like `kuttl` or `chainsaw`. Kustomize has no equivalent. Argo CD has post-sync hooks that can serve a similar purpose. The advantage of `helm test` is that tests are bundled with the chart — whoever installs the chart gets the tests for free and can verify the installation without understanding the application internals.

## The task

Write a `templates/tests/test-connection.yaml` that:

- Creates a Pod named `{{ .Release.Name }}-test-connection`
- Annotates it with `helm.sh/hook: test` and `helm.sh/hook-delete-policy: before-hook-creation`
- Sets `restartPolicy: Never`
- Has one container named `curl` using image `curlimages/curl:latest`
- The container command: `['curl', '--fail', '--silent', '--max-time', '5', 'http://{{ include "webapp.fullname" . }}:{{ .Values.service.port }}/health']`

Also write a `templates/tests/test-db-connection.yaml` that:

- Creates a Pod named `{{ .Release.Name }}-test-db`
- Same hook annotations as above, plus `helm.sh/hook-weight: "1"` (runs after the HTTP test)
- Uses image `postgres:15-alpine`
- Command: `['psql', '-h', '{{ .Release.Name }}-postgresql', '-U', '{{ .Values.postgresql.auth.username }}', '-c', 'SELECT 1']`
- Sets environment variable `PGPASSWORD` from a secretKeyRef pointing to `{{ .Release.Name }}-postgresql` secret, key `password`
