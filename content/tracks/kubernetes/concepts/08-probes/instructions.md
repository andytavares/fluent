# Probes

## What you'll learn

Kubernetes cannot tell whether your app is healthy by staring at the
container process — `docker ps`-style "is it running" is not the same
question as "can it serve traffic right now." Probes let you answer that
question yourself, but the three probe types gate three completely
different behaviors. Confusing them is the single most common cause of
"my healthy Pods keep getting killed" incidents.

## Key concepts

**What each probe actually gates:**

| Probe | On failure | Purpose |
|---|---|---|
| `livenessProbe` | kubelet **kills and restarts** the container | "Is this process stuck/deadlocked? Restart it." |
| `readinessProbe` | Pod is **removed from Service Endpoints** (not killed) | "Can this Pod take traffic right now?" |
| `startupProbe` | kubelet **kills and restarts** the container, but only counts *after* startup succeeds elsewhere it just holds off liveness/readiness | "Is the app still starting up? Don't judge it yet." |

Readiness failing does **not** restart anything — the Pod keeps running,
just gets no traffic until it passes again. This is the probe you want for
"warming up a cache" or "temporarily overloaded, back off traffic." Liveness
failing is destructive — only use it for "this process is truly wedged and
a restart is the only fix" (deadlock, unrecoverable panic loop).

**Probe mechanisms** — any probe type can use any of these:

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

- `httpGet` — 2xx/3xx response = success, anything else = failure.
- `tcpSocket` — TCP connection succeeds = success (no HTTP semantics).
- `exec` — a command inside the container; exit code 0 = success.

**Timing fields, precisely:**

- `initialDelaySeconds` — wait this long after container start before the
  *first* probe fires.
- `periodSeconds` — how often to probe (default 10).
- `timeoutSeconds` — how long to wait for a probe response before counting
  it a failure (default 1 — often too aggressive for a busy app).
- `failureThreshold` — consecutive failures before acting (restart for
  liveness/startup, Endpoints removal for readiness).
- `successThreshold` — consecutive successes needed to flip back to healthy
  (default 1; must be 1 for liveness/startup).

**`startupProbe` exists specifically for slow-starting apps.** Before it was
added, you had one bad choice: set `initialDelaySeconds` on the liveness
probe long enough for the slowest possible startup (JVM warmup, large cache
load), which meant *every* restart — even a fast one — waited that same long
delay before liveness protection kicked in. `startupProbe` decouples this:
liveness and readiness are disabled entirely until `startupProbe` succeeds
(or exhausts `failureThreshold * periodSeconds`, at which point the
container is killed as a failed startup). Once it succeeds once, it's never
checked again for that container's lifetime, and liveness/readiness take
over normally.

## The classic failure mode: liveness that kills healthy Pods under load

A liveness probe with `timeoutSeconds: 1` hitting `/healthz` on an app that,
under real production load, occasionally takes 1.5s to respond (GC pause,
a slow dependency) will start failing — not because the app is broken, but
because it's busy. The kubelet restarts it. Now you have *fewer* healthy
Pods handling the *same* load, so the remaining Pods get busier, so more
liveness probes time out, so more restarts happen. This cascading
liveness-induced outage is real and common. Guardrails:

- Liveness checks should test "is the process alive," not "is a downstream
  dependency healthy." A liveness probe that calls out to a database means a
  database blip restarts your entire fleet simultaneously.
- Give liveness generous `timeoutSeconds`/`failureThreshold` — it should be
  the last resort, not the first line of defense. Readiness is where you put
  strict, fast, dependency-aware checks (removing an overloaded Pod from
  rotation is safe; restarting it is not).
- Never point liveness and readiness at the same endpoint with the same
  thresholds if that endpoint checks downstream dependencies.

## vs other tools

| | Kubernetes probes | AWS ALB target group health check | Docker `HEALTHCHECK` |
|---|---|---|---|
| Distinct liveness/readiness | Yes — different failure actions | One health check, one action (deregister) | One check, informational (`unhealthy` status) only unless orchestrated |
| Startup grace period | `startupProbe` (dedicated mechanism) | `HealthCheckGracePeriod` (single value) | No native equivalent |
| Failure action | Restart (liveness) or deregister (readiness) | Deregister only | No automatic action without an external orchestrator |

Kubernetes' liveness/readiness split is more expressive than most platforms'
single health check — the tradeoff is you must actually think about which
endpoint means which thing, rather than reusing one `/health` for
everything.

## Watch out

- **Never call downstream dependencies from a liveness endpoint.** A
  transient database outage should reduce readiness (stop taking traffic),
  not trigger a fleet-wide restart storm.
- **`timeoutSeconds` defaults to 1 second** — too tight for many real
  endpoints under load. Set it explicitly.
- **A missing `startupProbe` on a slow-starting app forces you to inflate
  `initialDelaySeconds`** on liveness, which then applies to every restart,
  not just the first boot.

## The task

Write a Pod for an app with a slow startup that needs all three probes
properly separated:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: app`
- one container: `name: app`, `image: app:1.0`
- `livenessProbe`: `httpGet.path: /healthz`, `httpGet.port: 8080`,
  `initialDelaySeconds: 15`, `periodSeconds: 10`, `timeoutSeconds: 2`,
  `failureThreshold: 3`
- `readinessProbe`: `httpGet.path: /ready`, `httpGet.port: 8080`,
  `periodSeconds: 5`, `failureThreshold: 3`
- `startupProbe`: `httpGet.path: /startupz`, `httpGet.port: 8080`,
  `failureThreshold: 30`, `periodSeconds: 10`

Expected shape:

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
