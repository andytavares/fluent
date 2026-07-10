# Rollout Strategies

## What you'll learn

A Deployment's `strategy` field controls *how* old Pods are replaced with
new ones when you change the Pod template (new image, new env var, anything
under `spec.template`). Get `maxSurge`/`maxUnavailable` wrong and you either
overload your cluster with too many Pods at once, or take capacity away from
a service under load. This lesson works through the arithmetic so rollouts
stop being a black box.

## Key concepts

**Two strategy types:**

```yaml
spec:
  strategy:
    type: RollingUpdate   # default
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  minReadySeconds: 10
```

- **`RollingUpdate`** (default) — replaces Pods incrementally, old and new
  versions coexist during the rollout. Zero downtime if done correctly.
- **`Recreate`** — kills *all* old Pods before creating any new ones.
  Guarantees no two versions ever run simultaneously, at the cost of a
  downtime window. Use this only when your app cannot tolerate two versions
  running concurrently (e.g. a schema-incompatible database migration, a
  singleton that can't have two writers).

**`maxSurge` and `maxUnavailable`** — both can be an absolute number or a
percentage of `replicas`, and both default to `25%`.

- `maxSurge` — how many Pods *above* the desired `replicas` count the
  rollout may create temporarily.
- `maxUnavailable` — how many Pods *below* `replicas` the rollout may drop
  to temporarily.

**Worked example:** `replicas: 10`, `maxSurge: 2`, `maxUnavailable: 1`.

- Ceiling on total Pods during rollout: `10 + 2 = 12`.
- Floor on available Pods during rollout: `10 - 1 = 9`.
- The rollout controller creates up to 2 new Pods, waits for them to become
  Ready, then starts terminating old ones — always keeping total Pods
  between 9 and 12, never going below 9 available.

Setting `maxUnavailable: 0` guarantees full capacity throughout the rollout
(at the cost of needing `maxSurge` room to create replacements first) — the
standard choice for capacity-sensitive production services.

**`minReadySeconds`** — how long a new Pod must stay Ready before the
rollout controller counts it as "available" and proceeds to the next batch.
Without this, a Pod that becomes Ready and then immediately crash-loops
doesn't slow the rollout down — by the time it's noticed, half the fleet
may already be on the bad version. `minReadySeconds: 10` forces a 10-second
soak per batch, giving crash-loops a chance to surface before more old Pods
are torn down.

## When rollouts get stuck

A rollout stalls (`kubectl rollout status` hangs) when new Pods never become
Ready — usually a readiness probe failing (next lesson), a bad image tag, or
a config error. Because `maxUnavailable` caps how many old Pods can be torn
down, a stuck rollout **does not take your service down** — old Pods stay up
serving traffic while the broken new Pods sit un-Ready. This is the safety
net RollingUpdate buys you over Recreate. Diagnose stuck rollouts with
`kubectl rollout status deployment/<name>` and `kubectl describe pod` on the
new (Pending/CrashLooping) Pods; recover with `kubectl rollout undo
deployment/<name>`, which reverts `spec.template` to the previous
ReplicaSet's revision.

## vs other tools

| | Kubernetes RollingUpdate | Blue/green (generic) | Recreate |
|---|---|---|---|
| Downtime | None, if `maxUnavailable` tuned | None (traffic cutover) | Yes — full stop/start gap |
| Two versions coexist | Yes, transiently | Yes, until cutover | Never |
| Rollback | `kubectl rollout undo` (fast — old ReplicaSet retained) | Re-point traffic | Full redeploy |
| Resource overhead | `maxSurge` extra Pods, transiently | 2x steady-state during cutover | None extra |

RollingUpdate is Kubernetes' built-in approximation of blue/green without
needing a second full environment — the trade-off is that both versions
serve traffic simultaneously for the rollout's duration, so your app must
tolerate that (no breaking API/schema changes mid-rollout).

## Watch out

- **Percentages round up for `maxSurge`, down for `maxUnavailable`** (per
  the Kubernetes docs) when both are percentages — with small replica counts
  this matters. With `replicas: 3` and `maxUnavailable: 25%`, that rounds
  down to 0, meaning the rollout must surge first.
- **`maxUnavailable: 0` requires `maxSurge` to be nonzero** — otherwise the
  rollout has no room to create replacement Pods before removing old ones
  and stalls immediately.
- **Recreate is rare in practice** — reach for it only when concurrent
  versions are actively unsafe, not as a default "simpler" choice.

## The task

Write a Deployment for an API service that must never drop below full
capacity during a rollout, and must soak each new Pod for 10 seconds before
proceeding:

- `apiVersion: apps/v1`, `kind: Deployment`
- `metadata.name: api`
- `spec.replicas: 10`
- `spec.selector.matchLabels`: `app: api`
- `spec.template.metadata.labels`: `app: api`
- `spec.template.spec.containers` with one container: `name: api`,
  `image: api:2.0`, one port with `containerPort: 8080`
- `spec.strategy.type: RollingUpdate`
- `spec.strategy.rollingUpdate.maxSurge: 2`
- `spec.strategy.rollingUpdate.maxUnavailable: 0`
- `spec.minReadySeconds: 10`

Expected shape:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 10
  minReadySeconds: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: api:2.0
          ports:
            - containerPort: 8080
```
