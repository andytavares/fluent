# Autoscaling & Production Readiness

## What you'll learn

This is the capstone lesson: it ties together everything from probes,
resources, and rollouts into the specific objects and settings that
separate "it runs" from "it survives real production traffic and real
production incidents." You'll write a HorizontalPodAutoscaler, a
PodDisruptionBudget, a PriorityClass, and the graceful-shutdown fields on a
Deployment — then walk away with a production checklist for everything
this track has covered.

## Key concepts

**HorizontalPodAutoscaler (HPA)** — adjusts `replicas` automatically based
on observed metrics:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

- `metrics[].resource.target.averageUtilization: 70` targets 70% of the
  Pod's **requested** CPU (not the node's capacity, not the limit) — this
  is exactly why accurate `resources.requests` from the resources-and-QoS
  lesson matters: HPA math is only as good as the request you set it
  against.
- `behavior.scaleDown.stabilizationWindowSeconds` — how long the HPA looks
  back before scaling down, to avoid flapping on a brief traffic dip. There's
  no equivalent default delay on scale-up (it reacts fast on the way up,
  cautious on the way down — asymmetric by design, since under-provisioning
  hurts more than over-provisioning).
- HPA requires the metrics-server (or a custom/external metrics adapter for
  non-CPU/memory signals) running in the cluster — without it, `kubectl get
  hpa` shows `<unknown>` for current metrics and nothing scales.

**PodDisruptionBudget (PDB)** — limits **voluntary** disruptions (node
drains for maintenance, cluster-autoscaler scale-down, `kubectl drain`) so
a rolling maintenance operation can't take out too many replicas of the
same app at once:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web
```

`minAvailable: 2` means any voluntary eviction that would drop available
`app: web` Pods below 2 is blocked — the eviction API call fails until
capacity recovers. **PDBs do nothing for involuntary disruption** (a node
crashing outright, an OOM kill) — they only constrain operations that go
through the eviction API and can choose to wait.

**PriorityClass** — which Pods get preempted first when the cluster is
resource-constrained:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description: "Critical customer-facing services"
```

Higher `value` = higher priority. When the scheduler can't fit a Pod
anywhere, it may **preempt** (evict) lower-priority Pods on a node to make
room for a higher-priority one that would otherwise stay `Pending`. Without
any PriorityClass set, all Pods default to priority 0 — everything is
equally preemptable, meaning your most critical service has no protection
from being evicted for anything else.

**Graceful shutdown — the settings that prevent dropped requests during
every rollout, scale-down, and node drain:**

```yaml
spec:
  terminationGracePeriodSeconds: 30
  containers:
    - name: web
      lifecycle:
        preStop:
          exec:
            command: ["sleep", "5"]
```

The shutdown sequence, precisely: Kubernetes sends `SIGTERM` to the
container's main process **and simultaneously** removes the Pod from
Service `Endpoints`. Those two things race — some in-flight requests may
still be routed to the Pod for a moment after `SIGTERM` because Endpoints
propagation (to kube-proxy, to any Ingress controller) isn't instant.
`preStop.sleep` (or an equivalent short delay) exists purely to bridge that
gap: it delays the actual `SIGTERM`-triggered shutdown just long enough for
Endpoints removal to propagate everywhere, so no new requests land on a
Pod that's already shutting down. After the grace period
(`terminationGracePeriodSeconds`, default 30s) elapses — counted from when
`preStop` begins — if the container hasn't exited on its own, Kubernetes
sends `SIGKILL`. Your application **must handle `SIGTERM`** by finishing
in-flight requests and exiting cleanly; if it ignores `SIGTERM` entirely,
every shutdown becomes a hard `SIGKILL` after the full grace period, every
time.

## vs other tools

| | Kubernetes production controls | AWS ASG + ALB | Nomad |
|---|---|---|---|
| Autoscaling | HPA (metrics-driven), Cluster Autoscaler (node-level) | Target tracking scaling policies | Nomad autoscaler (external) |
| Disruption budget | PodDisruptionBudget | ALB connection draining + ASG termination lifecycle hooks | No direct built-in equivalent |
| Priority/preemption | PriorityClass | Not applicable (whole instances, not sub-instance workloads) | Preemption via job priority |
| Graceful shutdown | `preStop` + `terminationGracePeriodSeconds` + app SIGTERM handling | ALB deregistration delay + app SIGTERM handling | Same SIGTERM contract, `kill_timeout` |

The SIGTERM-then-grace-period-then-SIGKILL contract is near-universal
across orchestrators — what's Kubernetes-specific is the *race* between
Endpoints removal and SIGTERM delivery, which is why `preStop` sleep is a
Kubernetes-specific idiom rather than a general "handle SIGTERM" concern.

## The production checklist

Pulling together the whole track, every workload going to production
should have:

- **Deployment**, never a bare Pod (concept 1, 3) — self-healing baseline.
- **`RollingUpdate` with `maxUnavailable`/`maxSurge` sized for your
  capacity needs**, plus `minReadySeconds` (concept 4).
- **A Service** with correct `port`/`targetPort`, and an **Ingress** if
  externally reachable (concepts 5, 6).
- **ConfigMap/Secret-driven config**, not baked into the image (concept 7).
- **All three probe types set correctly** — liveness never checking
  downstream dependencies, readiness strict, startup covering slow boot
  (concept 8).
- **Explicit `requests`/`limits`** sized from real usage, ideally
  `Guaranteed` QoS for anything latency-critical (concept 9).
- **PVCs for anything stateful**, StatefulSet instead of Deployment where
  identity/storage-per-replica matters (concepts 10, 11).
- **RBAC scoped to least privilege** via a dedicated ServiceAccount
  (concept 13), **NetworkPolicy** default-deny plus explicit allows
  (concept 14).
- **Scheduling constraints** (`topologySpreadConstraints` for zone
  spreading, at minimum) so a single zone/node failure doesn't take out the
  whole service (concept 15).
- **HPA, PDB, PriorityClass, and graceful shutdown** — this lesson's four
  additions — so the service scales under load, survives planned
  maintenance, is protected from preemption relative to less-critical
  workloads, and drops zero requests during a rollout or drain.

## Watch out

- **HPA math uses `requests`, not `limits` or node capacity** — a
  `target.averageUtilization: 70` with an under-sized CPU request scales up
  far later than intended (or never, if the request is generous enough that
  70% of it is never reached under real load).
- **A PDB with `minAvailable` equal to (or greater than) `replicas`** blocks
  *all* voluntary evictions, including the ones a node drain needs to
  proceed — cluster maintenance can stall indefinitely on an over-strict
  PDB.
- **No PriorityClass means no protection** — under real resource pressure,
  your most important service is exactly as preemptable as a batch job
  unless you've explicitly set priorities apart.
- **Skipping `preStop` on a rolling update under real load is the single
  most common source of a brief spike in 5xx errors during deploys** — it's
  invisible in low-traffic testing and only shows up once you're pushing
  meaningful request volume.

## The task

Produce four YAML documents separated by `---`.

**Document 1** — HorizontalPodAutoscaler:

- `apiVersion: autoscaling/v2`, `kind: HorizontalPodAutoscaler`,
  `metadata.name: web-hpa`
- `spec.scaleTargetRef`: `apiVersion: apps/v1`, `kind: Deployment`,
  `name: web`
- `spec.minReplicas: 3`, `spec.maxReplicas: 20`
- `spec.metrics` with one entry: `type: Resource`,
  `resource.name: cpu`, `resource.target.type: Utilization`,
  `resource.target.averageUtilization: 70`
- `spec.behavior.scaleDown.stabilizationWindowSeconds: 300`

**Document 2** — PodDisruptionBudget:

- `apiVersion: policy/v1`, `kind: PodDisruptionBudget`,
  `metadata.name: web-pdb`
- `spec.minAvailable: 2`
- `spec.selector.matchLabels`: `app: web`

**Document 3** — PriorityClass:

- `apiVersion: scheduling.k8s.io/v1`, `kind: PriorityClass`,
  `metadata.name: high-priority`
- `value: 1000000`
- `globalDefault: false`

**Document 4** — a Pod spec fragment exercising priority and graceful
shutdown:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: web`
- `spec.priorityClassName: high-priority`
- `spec.terminationGracePeriodSeconds: 30`
- one container: `name: web`, `image: web:1.0`,
  `lifecycle.preStop.exec.command: ["sleep", "5"]`

Expected shape:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300

---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web

---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false

---
apiVersion: v1
kind: Pod
metadata:
  name: web
spec:
  priorityClassName: high-priority
  terminationGracePeriodSeconds: 30
  containers:
    - name: web
      image: web:1.0
      lifecycle:
        preStop:
          exec:
            command: ["sleep", "5"]
```
