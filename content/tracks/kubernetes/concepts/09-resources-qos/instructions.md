# Resources & QoS

## What you'll learn

`resources.requests` and `resources.limits` look like a single "how much
does this need" setting but they control two completely different
mechanisms — one drives the scheduler, the other drives the kernel-level
enforcement on a running container. Get this distinction wrong and you'll
either under-provision the cluster (Pods failing to schedule) or
over-provision it (Pods getting throttled or OOM-killed despite "enough"
resources being configured).

## Key concepts

**Requests: what the scheduler reserves.**

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi"
```

`requests` is what the scheduler subtracts from a node's allocatable
capacity when deciding if a Pod fits. A node with 2 CPUs allocatable and
existing Pods requesting 1.5 CPUs has 0.5 CPU of *request* headroom left —
regardless of how idle those existing Pods' CPUs actually are right now.
Scheduling is a **request-based bin-packing problem**, not a real-time
utilization problem.

**Limits: what the kernel enforces on a running container.**

- **CPU limits → throttling, not killing.** CPU is a compressible resource:
  exceeding `limits.cpu` doesn't kill the container, it gets CPU-throttled
  by the kernel's CFS bandwidth controller — the container simply gets
  scheduled less, making it slower, not dead. `cpu: "500m"` means half a
  core's worth of time per scheduling period.
- **Memory limits → OOMKill.** Memory is incompressible — you can't
  "slow down" a container that wants more memory than it's allowed.
  Exceeding `limits.memory` gets the container killed by the kernel OOM
  killer (visible as `OOMKilled` in `kubectl describe pod`), and the kubelet
  restarts it per `restartPolicy`.

This asymmetry is the most important fact in this lesson: **a
CPU-starved container degrades; a memory-starved container dies.** Size
memory limits with real headroom — a CPU limit set too low costs latency,
a memory limit set too low costs availability.

**Units:** CPU is measured in cores; `"500m"` = 500 millicores = half a
core; `"1"` = one full core. Memory uses power-of-two suffixes (`Mi`, `Gi`)
or power-of-ten (`M`, `G`) — `256Mi` (268,435,456 bytes) ≠ `256M`
(256,000,000 bytes). Always use `Mi`/`Gi` unless you specifically mean
decimal SI units.

**QoS classes** — Kubernetes derives one of three classes per Pod purely
from how `requests`/`limits` are set, and uses it to decide **eviction
order** when a node is under memory pressure:

| Class | Condition | Evicted... |
|---|---|---|
| `Guaranteed` | every container sets `limits == requests` for both CPU and memory | last |
| `Burstable` | at least one container sets a request or limit, but doesn't qualify as Guaranteed | after BestEffort, before Guaranteed |
| `BestEffort` | no container sets any request or limit | first |

```yaml
# Guaranteed
resources:
  requests: { cpu: "500m", memory: "256Mi" }
  limits:   { cpu: "500m", memory: "256Mi" }

# Burstable
resources:
  requests: { cpu: "250m", memory: "128Mi" }
  limits:   { cpu: "500m", memory: "256Mi" }
```

Under node memory pressure, the kubelet evicts `BestEffort` Pods first,
then `Burstable` Pods (ranked by how far over their *request* they are),
and only touches `Guaranteed` Pods as an absolute last resort. This is why
critical, latency-sensitive workloads are usually configured `Guaranteed`
— it's the only class the eviction controller treats as untouchable.

## Right-sizing guidance

- **Set requests to your steady-state usage**, not your peak — requests
  drive bin-packing, and over-requesting wastes cluster capacity nobody
  else can use even if your Pod never touches it.
- **Set memory limits with real headroom above requests** (given OOMKill is
  destructive) but not so much headroom that a leak goes undetected for
  hours before hitting the ceiling.
- **CPU limits are optional and often deliberately omitted** for latency-
  sensitive services — an unset CPU limit lets a Pod burst above its
  request when the node has spare capacity, at the cost of "noisy neighbor"
  risk. Whether that trade-off is worth it is a per-workload call; there's
  no universally correct answer.
- **Never leave a production Pod with no requests/limits at all**
  (`BestEffort`) — it's the first thing killed under any memory pressure,
  and gives the scheduler zero information to bin-pack against.

## vs other tools

| | Kubernetes requests/limits | Docker `--memory`/`--cpus` | AWS ECS task CPU/memory |
|---|---|---|---|
| Scheduling input | `requests` only | N/A (single host) | Task-level CPU/memory reservation |
| Enforcement | `limits`, per-container | `--memory` (OOM), `--cpus` (CFS quota) — same underlying mechanism | Task-level hard limit |
| Derived priority class | QoS class (Guaranteed/Burstable/BestEffort) | None | None built-in |

The underlying cgroup mechanisms (CFS bandwidth for CPU, cgroup memory
limits for OOM) are identical to plain Docker — Kubernetes just adds the
scheduling layer and the QoS-driven eviction policy on top.

## Watch out

- **A Pod stuck `Pending` forever** almost always means its `requests`
  don't fit on any node — check `kubectl describe pod` for
  `Insufficient cpu`/`Insufficient memory` events.
- **"My container has memory to spare but keeps getting OOMKilled"** — check
  if the *limit* (not just usage) is set too low; the kernel kills based on
  the limit, not on whether the node itself has free memory.
- **CPU throttling is invisible unless you look for it** — a slow but not-
  crashing container under a tight CPU limit shows no errors, just elevated
  latency; check `container_cpu_cfs_throttled_seconds_total` if requests
  are latency-sensitive.

## The task

Produce two YAML documents separated by `---`, one Pod in each QoS class.

**Document 1** — a `Guaranteed` Pod:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: guaranteed-app`
- one container: `name: app`, `image: app:1.0`
- `resources.requests`: `cpu: "500m"`, `memory: "256Mi"`
- `resources.limits`: `cpu: "500m"`, `memory: "256Mi"` (identical to
  requests — this equality is what makes it Guaranteed)

**Document 2** — a `Burstable` Pod:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: burstable-app`
- one container: `name: app`, `image: app:1.0`
- `resources.requests`: `cpu: "250m"`, `memory: "128Mi"`
- `resources.limits`: `cpu: "500m"`, `memory: "256Mi"` (limits above
  requests — this gap is what makes it Burstable, not Guaranteed)

Expected shape:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-app
spec:
  containers:
    - name: app
      image: app:1.0
      resources:
        requests:
          cpu: "500m"
          memory: "256Mi"
        limits:
          cpu: "500m"
          memory: "256Mi"

---
apiVersion: v1
kind: Pod
metadata:
  name: burstable-app
spec:
  containers:
    - name: app
      image: app:1.0
      resources:
        requests:
          cpu: "250m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "256Mi"
```
