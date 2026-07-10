# Scheduling

## What you'll learn

The default scheduler already does bin-packing by requests (previous
lesson) — but real clusters need finer control: pin work to specific
hardware, spread replicas across failure domains, keep certain workloads
off certain nodes entirely, or trade "must" for "prefer" when constraints
get tight. This lesson covers the five mechanisms, roughly from bluntest to
most nuanced.

## Key concepts

**`nodeSelector` — the blunt instrument.** Exact-match against node labels,
nothing fancier:

```yaml
spec:
  nodeSelector:
    disktype: ssd
```

If no node has `disktype: ssd`, the Pod stays `Pending` forever. No partial
matching, no "prefer but don't require."

**Node affinity — `nodeSelector` with real logic.** Supports set-based
operators (`In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt`, `Lt`) and, unlike
`nodeSelector`, a **soft** ("prefer") variant alongside the hard one:

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values: [amd64]
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 50
          preference:
            matchExpressions:
              - key: zone
                operator: In
                values: [us-east-1a]
```

`required...` is a hard constraint (Pod won't schedule without a match, same
as `nodeSelector` but with richer expressions). `preferred...` is a ranked
hint: the scheduler tries to honor it (weighted 1–100, summed across
multiple preferred terms) but will schedule elsewhere rather than leave the
Pod `Pending`. The verbose name (`...IgnoredDuringExecution`) is
deliberate: it tells you this is checked only at scheduling time — if node
labels change after the Pod is already running, nothing evicts it.

**Pod affinity/anti-affinity — schedule relative to *other Pods*, not
node labels:**

```yaml
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app: web
          topologyKey: kubernetes.io/hostname
```

This says "don't co-locate this Pod with another Pod labeled `app: web`
on the same node" (`topologyKey: kubernetes.io/hostname` scopes "same" to
node; using `topology.kubernetes.io/zone` instead scopes it to "same
availability zone"). **Its cost matters**: pod (anti-)affinity requires the
scheduler to evaluate every other Pod's labels against every candidate
node, which is measurably more expensive than node affinity (a per-node,
not per-pod, check) — avoid it at very large Pod counts unless you actually
need anti-collocation guarantees (typically for HA of a stateful or
singleton-per-node workload).

**Taints and tolerations — the inverse of affinity.** A taint on a *node*
repels Pods unless they explicitly tolerate it:

```
kubectl taint nodes gpu-node-1 dedicated=gpu:NoSchedule
```

```yaml
spec:
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
```

Effects:

- `NoSchedule` — new Pods without a matching toleration won't be scheduled
  here; existing Pods already running are unaffected.
- `PreferNoSchedule` — soft version; the scheduler tries to avoid it.
- `NoExecute` — new Pods won't schedule *and* existing Pods without the
  toleration are **evicted** from the node.

Taints/tolerations answer "keep most things off this node" (dedicated GPU
nodes, spot instances, control-plane nodes); node affinity answers "pull
this Pod toward specific nodes." They're commonly paired: taint the
specialized nodes, then use both a toleration (to be allowed on them) and
node affinity (to actually prefer landing there) on the Pods meant for them
— a toleration alone doesn't attract a Pod to a node, it only permits it.

**`topologySpreadConstraints` — even distribution across a failure
domain**, the modern replacement for stacking multiple pod anti-affinity
rules to get "spread evenly across zones":

```yaml
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: web
```

`maxSkew: 1` caps the difference between the zone with the most matching
Pods and the zone with the fewest to at most 1. `whenUnsatisfiable:
DoNotSchedule` makes this a hard constraint (`ScheduleAnyway` makes it a
soft preference instead, mirroring the required/preferred split above).

## vs other tools

| | Kubernetes scheduling constraints | Nomad constraints/affinities | AWS ASG placement (AZ balancing) |
|---|---|---|---|
| Hard vs soft | `required`/`preferred` (affinity), `DoNotSchedule`/`ScheduleAnyway` (spread) | `constraint` (hard) / `affinity` (soft, weighted) | AZ-balanced by default, limited tuning |
| Node exclusion | Taints + tolerations | Node class / constraints | Not directly analogous |
| Even spread across zones/hosts | `topologySpreadConstraints` | Spread stanza | Built-in AZ balancing only |

The required/preferred split recurs across every one of these mechanisms —
once you've internalized it for node affinity, the same mental model
applies to pod affinity and topology spread.

## Watch out

- **A toleration does not attract a Pod to a tainted node** — it only lifts
  the repulsion. Pair it with node affinity if you actually want the Pod to
  land there, not just be allowed to.
- **`requiredDuringSchedulingIgnoredDuringExecution` is checked once, at
  scheduling time** — if the node's labels change afterward, already-running
  Pods are not re-evaluated or evicted. This surprises people expecting
  live enforcement.
- **Pod anti-affinity is expensive at scale** — a `required` anti-affinity
  rule across thousands of Pods materially slows scheduling; reach for
  `topologySpreadConstraints` for "spread evenly" instead of stacking
  several anti-affinity rules.
- **`nodeSelector` has no soft mode** — if you need "prefer but don't
  require," you must use node affinity's `preferred...` block, not
  `nodeSelector`.

## The task

Write a single Pod spec for a web replica that must run on amd64 nodes,
prefers a specific zone, must not share a node with another `app: web`
Pod, tolerates the `dedicated=gpu` taint, and spreads evenly across zones:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: web`
- `metadata.labels`: `app: web`
- one container: `name: web`, `image: web:1.0`
- `spec.nodeSelector`: `disktype: ssd`
- `spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms`
  with one entry: `matchExpressions` — `key: kubernetes.io/arch`,
  `operator: In`, `values: [amd64]`
- `spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution`
  with one entry: `weight: 50`, `preference.matchExpressions` — `key: zone`,
  `operator: In`, `values: [us-east-1a]`
- `spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution`
  with one entry: `labelSelector.matchLabels: app: web`,
  `topologyKey: kubernetes.io/hostname`
- `spec.tolerations` with one entry: `key: dedicated`, `operator: Equal`,
  `value: gpu`, `effect: NoSchedule`
- `spec.topologySpreadConstraints` with one entry: `maxSkew: 1`,
  `topologyKey: topology.kubernetes.io/zone`,
  `whenUnsatisfiable: DoNotSchedule`, `labelSelector.matchLabels: app: web`

Expected shape:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  nodeSelector:
    disktype: ssd
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values: [amd64]
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 50
          preference:
            matchExpressions:
              - key: zone
                operator: In
                values: [us-east-1a]
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app: web
          topologyKey: kubernetes.io/hostname
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: web
  containers:
    - name: web
      image: web:1.0
```
