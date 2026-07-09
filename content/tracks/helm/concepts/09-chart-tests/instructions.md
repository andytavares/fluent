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

## Watch out

- **`test` is a hook type, so everything from the hooks concept applies** — annotations not labels, weights for ordering, and delete policies. The one difference: leaving the Pod around after success (no `hook-succeeded` delete policy) is *intentional* here, so `helm test --logs` has something to read.
- **A test Pod that never terminates hangs `helm test` until timeout.** Always set a container command that exits (curl/psql/wget with explicit flags like `--max-time` or `-w`) rather than a long-running process — there's no `restartPolicy: Never` equivalent that saves you from a container that just never exits on its own.
- **Test pods run with whatever the *current* release's values are**, not the values from the install that's being tested against — if you `helm test` right after `helm upgrade`, the test Pod picks up the new values, which is usually what you want but matters if a test hardcodes an assumption from a previous version.
- **`command` as a YAML list vs a single string produces very different results.** `command: ['curl', '--fail', 'http://...']` runs `curl` directly; `command: ['sh', '-c', 'curl --fail http://...']` runs it through a shell (needed if you want shell features like `&&` or `$VAR` expansion). Pick the list form unless you actually need shell semantics — it avoids a whole class of quoting bugs.

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

For a release named `myapp` with `.Values.service.port: 8080` and `.Values.postgresql.auth.username: platform`, running `helm test myapp` executes both Pods and reports their results. The first renders as:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-test-connection
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  restartPolicy: Never
  containers:
    - name: curl
      image: curlimages/curl:latest
      command:
        - curl
        - --fail
        - --silent
        - --max-time
        - "5"
        - http://myapp-webapp:8080/health
```

(assuming `webapp.fullname` resolves to `myapp-webapp`). The second Pod adds `"helm.sh/hook-weight": "1"` so it runs after the first, and references the same release's PostgreSQL credentials Secret. Both must set `restartPolicy: Never` — `helm test` treats a Pod that could restart as ambiguous about when to report success.
