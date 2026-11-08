## What you build

You write a HorizontalPodAutoscaler, a PodDisruptionBudget, a PriorityClass and a Pod with graceful-shutdown fields. These objects make a service survive real traffic and real incidents. This lesson builds on **Resources & QoS**, **Probes** and **Rollout Strategies**.

## Key concepts

### An HPA sets `replicas` from metrics

A HorizontalPodAutoscaler (HPA) changes `replicas` automatically from observed metrics.

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

- `averageUtilization: 70` targets 70% of the **requested** CPU of the Pod, not the limit or the node capacity. The HPA is only as good as your `resources.requests`.
- `stabilizationWindowSeconds` is how far back the HPA looks before it scales down. It stops flapping on a short traffic dip.
- Scale-up has no default delay. The HPA reacts fast on the way up and slowly on the way down, because too few Pods hurt more than too many.
- The HPA needs metrics-server, or a custom or external metrics adapter for other signals. Without it, `kubectl get hpa` shows `<unknown>` and nothing scales.

### A PDB limits voluntary disruptions

A PodDisruptionBudget (PDB) limits voluntary disruptions: node drains, `kubectl drain` and cluster-autoscaler scale-down. Maintenance then cannot remove too many replicas of one app at once.

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

With `minAvailable: 2`, the eviction API refuses any eviction that leaves fewer than 2 available `app: web` Pods. The call fails until capacity recovers. A PDB does nothing for involuntary disruptions, such as a node crash or an OOM kill.

### A PriorityClass decides who gets preempted

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description:
  "Critical customer-facing services"
```

A higher `value` is a higher priority. When a Pod fits nowhere, the scheduler can preempt (evict) lower-priority Pods on a node to make room. Without a PriorityClass, all Pods have priority 0, so your most critical service has no protection.

### Graceful shutdown stops dropped requests

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

When a Pod terminates, Kubernetes removes it from the Service endpoints. At the same time, it starts the shutdown of the container. Endpoint removal reaches kube-proxy and Ingress controllers with a delay, so requests can still arrive.

The `preStop` sleep runs before `SIGTERM` and covers that delay. The grace period (`terminationGracePeriodSeconds`, default 30s) starts when `preStop` starts. If the container still runs at the end, Kubernetes sends `SIGKILL`.

Your application must handle `SIGTERM`: finish in-flight requests, then exit. An application that ignores `SIGTERM` gets a `SIGKILL` after the full grace period, every time. Most orchestrators share the `SIGTERM`, grace period, `SIGKILL` sequence; the endpoint race is specific to Kubernetes.

### The production checklist

Every production workload has:

- A Deployment, never a bare Pod (**Pods**, **Deployments**).
- `RollingUpdate` with `maxUnavailable` and `maxSurge` sized for your capacity, plus `minReadySeconds` (**Rollout Strategies**).
- A Service with the correct `port` and `targetPort`, and an Ingress if it is reachable from outside (**Services**, **Ingress**).
- Configuration from a ConfigMap or a Secret, not in the image (**ConfigMaps & Secrets**).
- All three probes: liveness never checks dependencies, readiness is strict, startup covers a slow boot (**Probes**).
- Explicit `requests` and `limits` from real use, with `Guaranteed` QoS for latency-critical work (**Resources & QoS**).
- PVCs for state, and a StatefulSet when identity or per-replica storage matters (**Volumes & Persistence**, **StatefulSets**).
- Least-privilege RBAC with a dedicated ServiceAccount (**RBAC & ServiceAccounts**).
- A default-deny NetworkPolicy plus explicit allows (**Network Policies**).
- At least `topologySpreadConstraints` across zones, so one zone or node failure does not stop the service (**Scheduling**).
- An HPA, a PDB, a PriorityClass and graceful shutdown, from this lesson.

## Watch out

- The HPA uses `requests`, not `limits`. A wrong CPU request makes it scale too late, or never.
- A PDB with `minAvailable` at or above `replicas` blocks all voluntary evictions. A node drain then waits forever.
- With no PriorityClass, your most important service is as preemptable as a batch job.
- No `preStop` causes a short 5xx spike on every deploy under load. Low-traffic tests do not show it.

## The task

Write four YAML documents in `stub.yaml`, separated by `---` lines.

1. Document 1 is a HorizontalPodAutoscaler named `web-hpa`.
2. Its `scaleTargetRef` is `apiVersion: apps/v1`, `kind: Deployment`, `name: web`.
3. It sets `minReplicas: 3` and `maxReplicas: 20`.
4. Its one metric is `type: Resource` with `name: cpu`.
5. The metric target is `type: Utilization`, `averageUtilization: 70`.
6. `behavior.scaleDown` sets `stabilizationWindowSeconds: 300`.
7. Document 2 is a PodDisruptionBudget named `web-pdb`.
8. It sets `minAvailable: 2` and selects `app: web`.
9. Document 3 is a PriorityClass named `high-priority`.
10. It sets top-level `value: 1000000` and `globalDefault: false`.
11. Document 4 is a Pod named `web` with `priorityClassName: high-priority`.
12. It sets `terminationGracePeriodSeconds: 30`.
13. It has one container `web` with `image: web:1.0`.
14. The container `preStop` hook runs `command: ["sleep", "5"]`.

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
