## What you build

You write a Pod for a slow-starting app with a liveness, a readiness and a startup probe. A running process is not the same as a process that can serve traffic. Each probe type controls a different action, and mixing them up kills healthy Pods. This lesson builds on **Services** and **Rollout Strategies**.

## Key concepts

### A failed `livenessProbe` restarts the container

The kubelet kills and restarts the container. Use it only when the process is truly stuck and a restart is the only fix, such as a deadlock.

### A failed `readinessProbe` removes the Pod from Service endpoints

The kubelet does not restart anything. The Pod keeps running, but gets no traffic until the probe passes again. Use it while the app warms a cache or backs off under load.

### A `startupProbe` holds the other probes back

Liveness and readiness checks do not run until the startup probe succeeds. If it fails `failureThreshold` times, the kubelet kills the container as a failed startup. After one success, the startup probe never runs again for that container.

### Every probe type can use three mechanisms

- `httpGet` succeeds on a 2xx or 3xx response. Any other response fails.
- `tcpSocket` succeeds when a TCP connection opens. It has no HTTP meaning.
- `exec` runs a command in the container. Exit code 0 succeeds.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
  failureThreshold: 3
startupProbe:
  httpGet:
    path: /startupz
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

### Five fields control timing

- `initialDelaySeconds` is the wait after container start before the first probe.
- `periodSeconds` is the interval between probes. The default is 10.
- `timeoutSeconds` is the wait for a response before a failure. The default is 1, often too short for a busy app.
- `failureThreshold` is the number of failures in a row before the action.
- `successThreshold` is the number of successes in a row to become healthy again. The default is 1, and liveness and startup require 1.

### `startupProbe` is for slow-starting apps

Without it, the liveness `initialDelaySeconds` must cover the slowest startup, such as JVM warm-up or a large cache load. Every restart then waits that long before liveness protects it. The startup probe allows up to `failureThreshold * periodSeconds` for startup. Here that is `30 * 10 = 300` seconds.

### A strict liveness probe can cause an outage under load

Take a liveness probe with `timeoutSeconds: 1`. Under load, the app sometimes takes 1.5 seconds, because of a GC pause or a slow dependency. The probe fails, and the kubelet restarts a busy but working container. Fewer Pods carry the same load, so more probes time out and more restarts follow.

### Keep liveness simple and lenient

- A liveness check tests that the process is alive, not that a dependency is healthy.
- A liveness probe that calls a database restarts the whole fleet when the database has a short outage.
- Give liveness generous `timeoutSeconds` and `failureThreshold`. It is the last resort.
- Put strict, fast, dependency-aware checks in readiness. Removing an overloaded Pod from rotation is safe; restarting it is not.
- Do not point liveness and readiness at one dependency-checking endpoint with the same thresholds.

A Docker `HEALTHCHECK` only reports `unhealthy`, and an ALB health check only deregisters. Kubernetes splits restart from deregister, so decide what each endpoint means.

## Watch out

- Do not call dependencies from a liveness endpoint. A database outage then restarts the whole fleet.
- `timeoutSeconds` defaults to 1 second. That is too short for many endpoints under load, so set it.
- Without a `startupProbe`, a slow app needs a large liveness `initialDelaySeconds`. That delay then applies to every restart.

## The task

Write a Pod in `stub.yaml` for an app with a slow startup. It needs three separate probes.

1. Set `apiVersion: v1`, `kind: Pod` and `metadata.name: app`.
2. Add one container with `name: app` and `image: app:1.0`.
3. Give every probe an `httpGet` on `port: 8080`.
4. `livenessProbe`: path `/healthz`, `initialDelaySeconds: 15`, `periodSeconds: 10`.
5. Also give `livenessProbe` the fields `timeoutSeconds: 2` and `failureThreshold: 3`.
6. `readinessProbe`: path `/ready`, `periodSeconds: 5`, `failureThreshold: 3`.
7. `startupProbe`: path `/startupz`, `failureThreshold: 30`, `periodSeconds: 10`.

The file must match this content:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: app:1.0
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 15
        periodSeconds: 10
        timeoutSeconds: 2
        failureThreshold: 3
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        periodSeconds: 5
        failureThreshold: 3
      startupProbe:
        httpGet:
          path: /startupz
          port: 8080
        failureThreshold: 30
        periodSeconds: 10
```
