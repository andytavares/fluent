## What you build

You write two test Pods that `helm test` runs against a live release. One checks the HTTP health endpoint, and one checks the database connection. This lesson builds on **Dependencies**.

## Key concepts

### `helm test` runs Pods against a live release

Chart tests are not unit tests of your templates. They are integration tests against live resources in a real or local cluster. They show the difference between "`helm install` succeeded" and "the app answers requests".

### A test is a Pod with the `test` hook

A test is a Pod template with the annotation `helm.sh/hook: test`. `helm test <release-name>` creates the Pod and waits for it to complete. The exit code of the container sets success or failure.

```yaml
{{- $url := printf "http://%s-webapp:%v"
      .Release.Name .Values.service.port }}
apiVersion: v1
kind: Pod
metadata:
  name: {{ .Release.Name }}-test-connection
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": >-
      before-hook-creation
spec:
  restartPolicy: Never
  containers:
    - name: wget
      image: busybox
      command: ['wget']
      args:
        - '--spider'
        - {{ $url | quote }}
```

### Put tests in `templates/tests/`

By convention, test templates go in `templates/tests/`. Helm renders every file in `templates/` and its subdirectories, so this directory only keeps the files in order.

### `before-hook-creation` lets you run tests again

Without it, a second `helm test` fails because the Pod already exists. `before-hook-creation` deletes the old test Pod before Helm creates a new one. Unlike install hooks, do not add `hook-succeeded` here. A Pod that stays after success keeps its logs for you.

### Test what the user sees

Test observable behavior, not internal implementation.

```yaml
# Good: the service answers on its port
command: ['curl', '-sf',
  'http://{{ .Release.Name }}-svc/health']

# Good: a database connection works
command: ['psql', '-h',
  '{{ .Release.Name }}-postgresql',
  '-U', 'app', '-c', 'SELECT 1']

# Avoid: a check that a Pod is Running.
# kubectl already does this.
```

### A chart can have many test Pods

Helm runs all test Pods and collects the results. If tests depend on each other, set the order with `helm.sh/hook-weight`.

### `helm test --logs` prints the container logs

The flag prints all container logs after the test run, which you need to debug failures. Print useful output in your test containers, for example `echo "Testing connection to..."` before the check.

### Run tests in CI after `--wait`

`--wait` makes Helm wait until all Deployments are ready. Without it, test Pods can run before the app serves traffic.

```bash
helm upgrade --install myapp ./chart \
  -f ci-values.yaml --wait
helm test myapp --logs
```

### Tests ship with the chart

Raw manifests and Kustomize have no test mechanism, so you write scripts or use `kuttl` or `chainsaw`. Argo CD post-sync hooks can do a similar job. With `helm test`, each user of the chart gets the tests and can check the installation.

## Watch out

- `test` is a hook type. Annotations, weights and delete policies from the Hooks concept apply.
- Do not add `hook-succeeded` to a test. Keep the Pod so `helm test --logs` can read it.
- A test Pod that never stops makes `helm test` wait until the timeout.
- Use a command that exits, with a limit like `--max-time`. `restartPolicy: Never` does not stop a container that never exits.
- A test Pod uses the values of the current release. After `helm upgrade`, the test uses the new values.
- A test that hardcodes an assumption from an earlier version can then fail.
- `command: ['curl', '--fail', 'http://...']` runs `curl` directly.
- `command: ['sh', '-c', 'curl --fail http://...']` runs it in a shell. You need that for `&&` or `$VAR`.
- Use the list form unless you need a shell. It prevents quoting bugs.

## The task

Write two test Pods in `stub.yaml`: `templates/tests/test-connection.yaml`, a `---` line, then `templates/tests/test-db-connection.yaml`.

1. Name the first Pod `{{ .Release.Name }}-test-connection`.
2. Give both Pods `"helm.sh/hook": test` and `"helm.sh/hook-delete-policy": before-hook-creation`.
3. Set `restartPolicy: Never` on both Pods.
4. The first Pod has one container, `curl`, with the image `curlimages/curl:latest`.
5. Its command is `['curl', '--fail', '--silent', '--max-time', '5', 'http://{{ include "webapp.fullname" . }}:{{ .Values.service.port }}/health']`.
6. Name the second Pod `{{ .Release.Name }}-test-db`. Add `"helm.sh/hook-weight": "1"`, so it runs after the first.
7. The second Pod uses the image `postgres:15-alpine`.
8. Its command is `['psql', '-h', '{{ .Release.Name }}-postgresql', '-U', '{{ .Values.postgresql.auth.username }}', '-c', 'SELECT 1']`.
9. Set the env variable `PGPASSWORD` with a `secretKeyRef`: name `{{ .Release.Name }}-postgresql`, key `password`.
10. Remove every `TODO` comment.

`helm test` needs a Pod that cannot restart. Otherwise it cannot tell when to report success.

```yaml
# Release myapp, service.port 8080,
# webapp.fullname = myapp-webapp
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
