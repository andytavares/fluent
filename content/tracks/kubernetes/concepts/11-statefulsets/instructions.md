# StatefulSets

## What you'll learn

A Deployment's Pods are interchangeable — any replica can be replaced by
any other, and none of them has a durable identity. That's wrong for
databases, queues, and anything where a replica's *identity* (which node in
a Raft group, which shard, which replica of a primary/replica pair) matters
across restarts. StatefulSet is the controller for exactly that case:
stable network identity, stable per-replica storage, and (optionally)
strictly ordered rollout.

## Key concepts

**Stable, predictable identity via ordinals.** A StatefulSet named `db`
with 3 replicas creates Pods named `db-0`, `db-1`, `db-2` — not random
suffixes. If `db-1` is deleted, its replacement is *also* named `db-1`,
not some new random name. This is the core property Deployments don't give
you: **identity survives rescheduling.**

**Stable network identity requires a headless Service.** A StatefulSet
*must* reference one via `serviceName`, matching the same headless Service
pattern from the Services lesson (`clusterIP: None`). This gives each Pod
its own resolvable DNS name: `db-0.db.default.svc.cluster.local`,
`db-1.db...`, etc. — clients that need to reach a *specific* replica (the
primary in a primary/replica setup, a specific shard) address it directly
by ordinal, rather than getting load-balanced to "any one of them."

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None
  selector:
    app: db
  ports:
    - port: 5432
```

**`volumeClaimTemplates` — per-replica persistent storage.** Instead of one
shared PVC (which breaks for RWO storage past a single replica, as covered
last lesson), a StatefulSet stamps out a *dedicated* PVC per ordinal from a
template:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db
  replicas: 3
  podManagementPolicy: OrderedReady
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: db
          image: postgres:15
          ports:
            - containerPort: 5432
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 10Gi
```

This produces PVCs named `data-db-0`, `data-db-1`, `data-db-2` — each bound
to its own backing volume. Critically, **these PVCs are not deleted when
the StatefulSet is scaled down or the Pod is rescheduled** — `db-1`'s data
survives a restart or even a temporary scale-to-zero, and reattaches to a
new `db-1` Pod later. (Deleting the StatefulSet itself, by default, still
leaves the PVCs behind — you delete those explicitly.)

**`podManagementPolicy`:**

- `OrderedReady` (default) — Pods are created/scaled/deleted one at a time,
  strictly in ordinal order, and each must become Ready before the next
  starts. Required when replica *N* depends on replica *N-1* already
  existing (e.g. joining a replication chain).
- `Parallel` — all Pods are created/deleted simultaneously, no ordering or
  readiness gating between them. Faster scaling, appropriate when replicas
  are independent (e.g. a sharded system where each shard bootstraps on its
  own).

## When a Deployment is wrong

Reach for StatefulSet instead of Deployment when your workload needs any
of: stable per-replica DNS names, stable per-replica storage that must
survive rescheduling, or ordered startup/shutdown. Classic candidates:
Postgres/MySQL replica sets, Kafka brokers, Elasticsearch/OpenSearch nodes,
ZooKeeper/etcd ensembles. If replicas are truly interchangeable and share
nothing (a stateless API server, a web frontend), a Deployment is simpler
and should be preferred — don't reach for StatefulSet's extra ceremony
"just in case."

## vs other tools

| | StatefulSet | Deployment | Docker Swarm (no direct equivalent) |
|---|---|---|---|
| Pod naming | Stable ordinals (`db-0`, `db-1`, ...) | Random hash suffix | Random |
| Per-replica storage | `volumeClaimTemplates`, one PVC per ordinal | Shared PVC (breaks RWO past 1 replica) | N/A |
| Ordered rollout/scale | `OrderedReady` (default) | No ordering guarantee | N/A |
| Stable DNS per replica | Yes, via headless Service | No — one VIP for the whole set | N/A |

Nothing in Swarm or plain ECS maps cleanly onto StatefulSet's guarantees —
this is one of the areas where Kubernetes solves a problem (stateful
clustered workloads) that container platforms without a Pod-identity model
struggle with structurally.

## Watch out

- **`serviceName` must reference an actual headless Service** you create
  separately — the StatefulSet doesn't create it for you.
- **Scaling down does not delete PVCs.** Scaling `replicas: 3` down to `1`
  leaves `data-db-1` and `data-db-2` orphaned but intact; scaling back up to
  3 reattaches the same data to `db-1`/`db-2`. This is a feature (protects
  against accidental data loss) but surprises people expecting Deployment-
  like ephemeral-replica semantics.
- **`OrderedReady` means one stuck Pod blocks the entire rollout/scale.**
  If `db-1` never becomes Ready, `db-2` is never created (scale-up) or
  `db-0` is never touched (rolling update proceeds in reverse ordinal
  order, highest first). This is deliberate but can look like a "hang" if
  you don't know to check the blocking ordinal.

## The task

Produce two YAML documents separated by `---`: the headless Service a
StatefulSet requires, and the StatefulSet itself.

**Document 1** — headless Service:

- `apiVersion: v1`, `kind: Service`, `metadata.name: db`
- `spec.clusterIP: None`
- `spec.selector`: `app: db`
- `spec.ports` with one entry: `port: 5432`

**Document 2** — StatefulSet:

- `apiVersion: apps/v1`, `kind: StatefulSet`, `metadata.name: db`
- `spec.serviceName: db`
- `spec.replicas: 3`
- `spec.podManagementPolicy: OrderedReady`
- `spec.selector.matchLabels`: `app: db`
- `spec.template.metadata.labels`: `app: db`
- `spec.template.spec.containers` with one container: `name: db`,
  `image: postgres:15`, one port with `containerPort: 5432`
- `spec.volumeClaimTemplates` with one entry: `metadata.name: data`,
  `spec.accessModes: [ReadWriteOnce]`, `spec.resources.requests.storage: 10Gi`

Expected shape:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None
  selector:
    app: db
  ports:
    - port: 5432

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db
  replicas: 3
  podManagementPolicy: OrderedReady
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: db
          image: postgres:15
          ports:
            - containerPort: 5432
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 10Gi
```
