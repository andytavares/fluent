## What you build

You write a headless Service and a StatefulSet for a three-replica Postgres. Deployment replicas are interchangeable, but a database replica has an identity that must survive restarts. This lesson builds on **Volumes & Persistence**.

## Key concepts

### Each Pod keeps its ordinal name

A StatefulSet named `db` with 3 replicas creates `db-0`, `db-1` and `db-2`, not random suffixes. When you delete `db-1`, its replacement is also `db-1`. A Deployment does not give this: the identity survives rescheduling.

### A headless Service gives each Pod a DNS name

A StatefulSet must name a headless Service (`clusterIP: None`) in `serviceName`. Each Pod then gets its own DNS name, such as `db-0.db.default.svc.cluster.local`. A client can reach one replica, such as the primary or one shard, instead of a load-balanced one.

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

### `volumeClaimTemplates` gives each replica its own PVC

One shared RWO PVC breaks past one replica. A StatefulSet creates one PVC per ordinal from a template instead.

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

This creates the PVCs `data-db-0`, `data-db-1` and `data-db-2`, each with its own volume. A scale-down or a reschedule does not delete them. The data of `db-1` reattaches to the next `db-1` Pod, even after a scale to zero. By default, deleting the StatefulSet also leaves the PVCs, and you delete them yourself.

### `podManagementPolicy` sets the order

- `OrderedReady` is the default. Kubernetes creates, scales and deletes one Pod at a time, in ordinal order. Each Pod must be Ready before the next one starts. Use it when replica N needs replica N-1, for example to join a replication chain.
- `Parallel` creates and deletes all Pods at the same time, with no readiness gate. Use it when replicas are independent, for example shards that start on their own.

### Use a StatefulSet only for stateful workloads

Use a StatefulSet when the workload needs stable DNS names per replica, stable storage per replica, or ordered startup and shutdown. Examples are Postgres and MySQL replica sets, Kafka brokers, Elasticsearch and OpenSearch nodes, and ZooKeeper and etcd ensembles. For interchangeable replicas, such as a stateless API server, use a Deployment. Docker Swarm and plain ECS have no direct equivalent of a StatefulSet.

## Watch out

- The StatefulSet does not create the headless Service. Create it yourself, or `serviceName` points at nothing.
- A scale-down from 3 to 1 keeps `data-db-1` and `data-db-2`. A scale-up reattaches the same data.
- With `OrderedReady`, one Pod that is never Ready blocks the rollout. A stuck `db-1` stops the creation of `db-2`.
- A rolling update goes in reverse ordinal order. A stuck `db-1` stops the update of `db-0`.

## The task

Write two YAML documents in `stub.yaml`, separated by a `---` line. Document 1 is the headless Service. Document 2 is the StatefulSet.

1. Name the Service `db` and set `clusterIP: None`.
2. The Service selects `app: db` and has one port, `5432`.
3. Name the StatefulSet `db` and set `serviceName: db`.
4. It has `replicas: 3` and `podManagementPolicy: OrderedReady`.
5. Its selector and its Pod template both use the label `app: db`.
6. It has one container `db` with `image: postgres:15`.
7. The container exposes `containerPort: 5432`.
8. It has one volume claim template named `data`.
9. The template uses `ReadWriteOnce` and requests `storage: 10Gi`.

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
