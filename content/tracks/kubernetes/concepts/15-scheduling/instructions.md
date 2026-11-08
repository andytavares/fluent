## What you build

You write one Pod spec that uses all five scheduling controls. The default scheduler bin-packs by requests, but real clusters need finer control over where Pods run. This lesson builds on **Resources & QoS**.

## Key concepts

### `nodeSelector` matches node labels exactly

`nodeSelector` is the simplest control. It has no partial match and no "prefer" mode.

```yaml
spec:
  nodeSelector:
    disktype: ssd
```

When no node has `disktype: ssd`, the Pod stays `Pending` forever.

### Node affinity adds operators and a soft mode

Node affinity supports the operators `In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt` and `Lt`. Unlike `nodeSelector`, it has a soft variant next to the hard one.

```yaml
# Under spec.affinity
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

- `required...` is a hard rule. With no match, the Pod does not schedule.
- `preferred...` is a hint. Each term has a weight from 1 to 100, and the scheduler sums the weights per node. With no match, the Pod still schedules on another node.

`IgnoredDuringExecution` means the scheduler checks the rule only at scheduling time. A label change on the node later does not evict a running Pod.

### Pod affinity places Pods next to other Pods

Pod affinity and anti-affinity use the labels of other Pods, not node labels.

```yaml
# Under spec.affinity
podAntiAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchLabels:
          app: web
      topologyKey: kubernetes.io/hostname
```

This rule keeps the Pod off any node that runs another `app: web` Pod. `topologyKey: kubernetes.io/hostname` makes "same" mean the same node. `topology.kubernetes.io/zone` makes it mean the same zone.

The scheduler checks the labels of every other Pod against every candidate node. Node affinity is a per-node check, so it is much cheaper. At very large Pod counts, use pod anti-affinity only for HA of a stateful or one-per-node workload.

### A taint keeps Pods off a node

A taint on a node repels every Pod that does not tolerate it.

```
kubectl taint nodes gpu-node-1 \
  dedicated=gpu:NoSchedule
```

```yaml
spec:
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
```

- `NoSchedule` stops new Pods without the toleration. Running Pods stay.
- `PreferNoSchedule` is the soft version. The scheduler tries to avoid the node.
- `NoExecute` stops new Pods and evicts running Pods without the toleration.

Use taints for dedicated GPU nodes, spot instances and control-plane nodes. A toleration only permits a Pod on the node; it does not pull the Pod there. To place Pods on tainted nodes, give them a toleration and node affinity.

### Topology spread constraints balance Pods across domains

`topologySpreadConstraints` spreads Pods evenly across a failure domain. It replaces a stack of pod anti-affinity rules.

```yaml
# Entry of spec.topologySpreadConstraints
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
  labelSelector:
    matchLabels:
      app: web
```

`maxSkew: 1` allows a difference of at most 1 matching Pod between the fullest zone and the emptiest zone. `DoNotSchedule` makes the rule hard, and `ScheduleAnyway` makes it soft.

### Hard and soft modes recur

Node affinity has `required` and `preferred`. Pod affinity has the same pair. Topology spread has `DoNotSchedule` and `ScheduleAnyway`. Nomad has the same split with `constraint` and `affinity`.

## Watch out

- A toleration does not attract a Pod to a tainted node. Add node affinity to place it there.
- The scheduler checks `required...` affinity once. A later node label change does not evict running Pods.
- `required` pod anti-affinity across thousands of Pods slows scheduling. Use `topologySpreadConstraints` for an even spread.
- `nodeSelector` has no soft mode. Use the `preferred...` block of node affinity for a preference.

## The task

Write one Pod in `stub.yaml` for a web replica. It needs an SSD and amd64, prefers one zone, and avoids other web Pods. It also tolerates a GPU taint and spreads across zones.

1. Name the Pod `web` and give it the label `app: web`.
2. It has one container `web` with `image: web:1.0`.
3. `nodeSelector` requires `disktype: ssd`.
4. Required node affinity: `kubernetes.io/arch` `In` `[amd64]`.
5. Preferred node affinity, `weight: 50`: `zone` `In` `[us-east-1a]`.
6. Required pod anti-affinity selects `app: web`.
7. The anti-affinity uses `topologyKey: kubernetes.io/hostname`.
8. A toleration matches `dedicated` `Equal` `gpu`, effect `NoSchedule`.
9. One spread constraint has `maxSkew: 1` and `DoNotSchedule`.
10. It uses `topologyKey: topology.kubernetes.io/zone` and selects `app: web`.

Write each `values` list in flow form, such as `[amd64]`.

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
