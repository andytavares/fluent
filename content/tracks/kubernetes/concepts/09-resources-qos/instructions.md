## What you build

You write two Pods in `stub.yaml`: one in the `Guaranteed` QoS class and one in the `Burstable` QoS class. Requests and limits look like one setting, but they control two different mechanisms. This lesson builds on **Probes**.

## Key concepts

### Requests drive the scheduler

The scheduler subtracts `requests` from the allocatable capacity of a node to decide if a Pod fits. Scheduling is request-based bin-packing, not real-time use.

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi"
```

A node has 2 CPUs allocatable, and its Pods request 1.5 CPUs. It has 0.5 CPU of request headroom, even when those Pods are idle.

### Limits drive the kernel

The kernel enforces `limits` on a running container. The result depends on the resource:

- **CPU is compressible.** Above `limits.cpu`, the CFS bandwidth controller throttles the container. The container runs slower, but it does not die.
- **Memory is incompressible.** Above `limits.memory`, the kernel OOM killer kills the container. The kubelet then restarts it according to `restartPolicy`.

`kubectl describe pod` shows the kill as `OOMKilled`. A CPU-starved container degrades, and a memory-starved container dies. A CPU limit that is too low costs latency. A memory limit that is too low costs availability.

### CPU uses cores, memory uses bytes

`"1"` is one core. `"500m"` is 500 millicores, or half a core per scheduling period. Memory uses power-of-two suffixes (`Mi`, `Gi`) or power-of-ten suffixes (`M`, `G`).

```
256Mi = 268,435,456 bytes
256M  = 256,000,000 bytes
```

Use `Mi` and `Gi` unless you mean decimal SI units.

### The QoS class comes from requests and limits

Kubernetes gives each Pod one of three QoS classes. The class sets the eviction order when a node is under memory pressure.

| Class | Condition | Evicted |
|---|---|---|
| `Guaranteed` | Every container sets `limits` equal to `requests` for CPU and memory | Last |
| `Burstable` | At least one container sets a request or limit, but the Pod is not `Guaranteed` | Second |
| `BestEffort` | No container sets a request or limit | First |

```yaml
# Guaranteed
requests: { cpu: "500m", memory: "256Mi" }
limits:   { cpu: "500m", memory: "256Mi" }

# Burstable
requests: { cpu: "250m", memory: "128Mi" }
limits:   { cpu: "500m", memory: "256Mi" }
```

The kubelet ranks `Burstable` Pods by how far their use is above their request. It evicts `Guaranteed` Pods only as a last resort. For this reason, teams often run critical, latency-sensitive workloads as `Guaranteed`.

### Size requests for steady state

- Set requests to steady-state use, not peak use. A request reserves capacity that no other Pod can use, even when your Pod is idle.
- Set memory limits with real headroom above requests, because an OOM kill is destructive. Too much headroom lets a leak run for hours before it hits the limit.
- CPU limits are optional. Teams often omit them for latency-sensitive services. With no CPU limit, a Pod can use spare node CPU, but it can disturb its neighbors.
- Do not run a production Pod as `BestEffort`. It is the first Pod to go under memory pressure, and the scheduler has no data to bin-pack against.

The cgroup mechanisms are the same as in plain Docker; Kubernetes adds the scheduling layer and the QoS eviction policy on top.

## Watch out

- A Pod stays `Pending` when its `requests` fit on no node. Look for `Insufficient cpu` events in `kubectl describe pod`.
- A container gets `OOMKilled` while the node has free memory. The kernel kills based on the limit, not on node memory.
- CPU throttling shows no errors, only higher latency. Check `container_cpu_cfs_throttled_seconds_total` for latency-sensitive workloads.

## The task

Write two Pods in `stub.yaml`, one in each QoS class. Separate the two YAML documents with a `---` line.

1. Document 1 is a Pod named `guaranteed-app`.
2. Its container `app` uses `image: app:1.0`.
3. Its requests are `cpu: "500m"` and `memory: "256Mi"`.
4. Its limits are equal to its requests. This makes the Pod `Guaranteed`.
5. Document 2 is a Pod named `burstable-app`.
6. Its container `app` uses `image: app:1.0`.
7. Its requests are `cpu: "250m"` and `memory: "128Mi"`.
8. Its limits are `cpu: "500m"` and `memory: "256Mi"`.
9. Limits above requests make the Pod `Burstable`.

Quote every CPU and memory value.

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
