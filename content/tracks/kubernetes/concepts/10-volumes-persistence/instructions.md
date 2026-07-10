# Volumes & Persistence

## What you'll learn

A container's writable filesystem dies with the container. Volumes give a
Pod storage that outlives a container restart (and, with the right kind,
outlives the Pod itself). This lesson covers the full spectrum: ephemeral
scratch space, the PV/PVC abstraction that decouples "I need storage" from
"here's the actual disk," and the reclaim-policy detail that decides whether
your data survives a claim deletion.

## Key concepts

**`emptyDir`** — scratch space created fresh when the Pod is scheduled,
deleted when the Pod is removed from the node. Shared between all
containers in the Pod (this is how a sidecar and a main container exchange
files):

```yaml
volumes:
  - name: cache
    emptyDir: {}
volumeMounts:
  - name: cache
    mountPath: /cache
```

Survives container *restarts* within the same Pod (the volume isn't
recreated, only the container process is) but not Pod deletion/rescheduling.

**`hostPath`** — mounts a path from the *node's* filesystem directly into
the Pod. Useful for node-level agents (log collectors, CNI plugins) that
need access to host state; a poor choice for application data, because the
Pod is now implicitly pinned to whatever happens to be on that specific
node — there's no portability, and most clusters restrict it via policy for
security reasons (a Pod with hostPath access can often read/write
arbitrary host files).

**The PV/PVC model** — the abstraction for storage that must outlive a
Pod:

- **PersistentVolume (PV)** — a piece of real storage (an EBS volume, an
  NFS export, a Ceph RBD image) represented as a cluster-level object. Admins
  either provision these manually, or (more commonly) a **StorageClass**
  provisions them **dynamically**, on demand, when a claim asks for one.
- **PersistentVolumeClaim (PVC)** — a Pod-facing *request* for storage:
  "give me 10Gi, ReadWriteOnce, from the `standard` class." The claim binds
  to a matching PV (existing or dynamically created); the Pod mounts the
  claim, never the PV directly.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
```

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
volumeMounts:
  - name: data
    mountPath: /data
```

This indirection is the entire point: your Pod spec says "mount
`data-pvc`" — completely portable across a laptop cluster (where the
`standard` class might be `hostPath`-backed), a cloud cluster (where it's
EBS/PD-backed), and an on-prem cluster (where it's Ceph-backed). Nothing in
the Pod spec changes.

**`accessModes`** — what the underlying storage supports, not what you
want:

| Mode | Meaning |
|---|---|
| `ReadWriteOnce` (RWO) | mountable read-write by a single node at a time (most block storage — EBS, GCE PD) |
| `ReadOnlyMany` (ROX) | mountable read-only by many nodes |
| `ReadWriteMany` (RWX) | mountable read-write by many nodes (needs a network filesystem — NFS, EFS, Filestore) |
| `ReadWriteOncePod` (RWOP) | read-write by a single **Pod** (stricter than RWO, which allows multiple Pods on the same node) |

Most cloud block storage is RWO-only — this is why a Deployment with
`replicas > 1` sharing one PVC on EBS-backed storage will fail to schedule
past the first replica; RWX (NFS/EFS) or per-replica claims (StatefulSets,
next lesson) are the fixes.

**Reclaim policy** — what happens to the underlying storage when its PVC is
deleted:

- `Delete` (the usual default for dynamically-provisioned volumes) — the PV
  *and* the backing storage (the actual EBS volume, etc.) are deleted.
- `Retain` — the PV object and backing storage survive PVC deletion, but the
  PV becomes `Released` and won't automatically bind to a new claim until
  an admin manually intervenes. Use this for anything where accidental PVC
  deletion must not mean data loss.

## vs other tools

| | Kubernetes PV/PVC | Docker named volumes | Cloud-native disk (raw EBS) |
|---|---|---|---|
| Provisioning | Dynamic, via StorageClass | Manual (`docker volume create`) | Manual, or via IaC |
| Portability across environments | Yes — same PVC spec, different backing StorageClass | No — tied to the Docker host | No — tied to the cloud provider |
| Reclaim behavior | Configurable (`Delete`/`Retain`) | Manual (`docker volume rm`) | Manual |

The PV/PVC split exists precisely to give you Docker-named-volume-like
ergonomics ("just mount `data-pvc`") while the actual backing implementation
is swappable per cluster/environment.

## Watch out

- **A PVC stuck `Pending` forever** usually means no StorageClass matches,
  or (on a cluster with only RWO storage) two Pods are trying to mount the
  same PVC RWO on different nodes simultaneously.
- **`emptyDir` is not persistent** — a common mistake is treating it as
  durable storage; it vanishes the moment the Pod is deleted or rescheduled
  to another node.
- **Reclaim policy is set on the PV, not the PVC** — if your StorageClass
  defaults to `Delete` and that's wrong for your data, you must override
  `reclaimPolicy` on the StorageClass (or the resulting PV) before, not
  after, you need it.
- **`hostPath` breaks Pod portability** — a Pod using it can only run
  correctly on nodes that actually have that path populated, defeating the
  scheduler's freedom to place it anywhere.

## The task

Produce two YAML documents separated by `---`.

**Document 1** — a PersistentVolumeClaim for durable app data:

- `apiVersion: v1`, `kind: PersistentVolumeClaim`
- `metadata.name: data-pvc`
- `spec.accessModes`: `[ReadWriteOnce]`
- `spec.storageClassName: standard`
- `spec.resources.requests.storage: 10Gi`

**Document 2** — a Pod using both `emptyDir` scratch space and the PVC
above:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: app`
- one container: `name: app`, `image: app:1.0`
- `volumeMounts` with two entries: `name: cache`, `mountPath: /cache`; and
  `name: data`, `mountPath: /data`
- `spec.volumes` with two entries: `name: cache` with `emptyDir: {}`; and
  `name: data` with `persistentVolumeClaim.claimName: data-pvc`

Expected shape:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: app:1.0
      volumeMounts:
        - name: cache
          mountPath: /cache
        - name: data
          mountPath: /data
  volumes:
    - name: cache
      emptyDir: {}
    - name: data
      persistentVolumeClaim:
        claimName: data-pvc
```
