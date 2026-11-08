## What you build

You write a PersistentVolumeClaim and a Pod that mounts it next to an `emptyDir` scratch volume. The writable filesystem of a container dies with the container, and volumes give a Pod storage that lives longer. This lesson builds on **ConfigMaps & Secrets**.

## Key concepts

### `emptyDir` lives as long as the Pod

Kubernetes creates an `emptyDir` volume when it schedules the Pod. It deletes the volume when it removes the Pod from the node. All containers in the Pod share it, so a sidecar and a main container can exchange files.

```yaml
volumes:
  - name: cache
    emptyDir: {}
volumeMounts:
  - name: cache
    mountPath: /cache
```

The volume survives a container restart, because only the container process restarts. It does not survive Pod deletion or rescheduling.

### `hostPath` mounts a node directory

`hostPath` mounts a path from the filesystem of the node into the Pod. Node-level agents, such as log collectors and CNI plugins, use it to read host state. It is a poor choice for application data, because the Pod depends on the contents of one node. Most clusters restrict `hostPath` by policy, because a Pod with it can often read and write any host file.

### A PVC requests storage, a PV is the storage

The PV/PVC model gives storage that outlives a Pod.

- A **PersistentVolume (PV)** is a cluster object for real storage: an EBS volume, an NFS export or a Ceph RBD image. An admin creates it by hand, or a **StorageClass** provisions it dynamically when a claim asks.
- A **PersistentVolumeClaim (PVC)** is a request for storage, for example "10Gi, `ReadWriteOnce`, class `standard`". The claim binds to a matching PV. The Pod mounts the claim, never the PV.

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

The Pod spec stays the same on every cluster. On a laptop, `standard` can use `hostPath`. In a cloud, it can use EBS or PD. On premises, it can use Ceph. Docker named volumes give the same "mount by name" use, but each one belongs to one Docker host.

### Access modes state what the storage supports

| Mode | Meaning |
|---|---|
| `ReadWriteOnce` (RWO) | Read-write by one node at a time. Most block storage, such as EBS and GCE PD. |
| `ReadOnlyMany` (ROX) | Read-only by many nodes. |
| `ReadWriteMany` (RWX) | Read-write by many nodes. It needs a network filesystem, such as NFS, EFS or Filestore. |
| `ReadWriteOncePod` (RWOP) | Read-write by one Pod. RWO allows many Pods on the same node. |

Most cloud block storage supports only RWO. A Deployment with `replicas > 1` that shares one EBS-backed PVC cannot schedule replicas on other nodes. Use RWX storage, or one claim per replica with a StatefulSet.

### The reclaim policy decides what happens to the data

The reclaim policy acts when you delete the PVC:

- `Delete` is the usual default for dynamically provisioned volumes. Kubernetes deletes the PV and the backing storage, such as the EBS volume.
- `Retain` keeps the PV and the backing storage. The PV becomes `Released` and does not bind to a new claim until an admin acts.

Use `Retain` for data that must survive an accidental PVC deletion.

## Watch out

- A PVC stays `Pending` when no StorageClass matches. Check the `storageClassName`.
- Two Pods on different nodes cannot mount one RWO PVC. The second Pod does not start.
- `emptyDir` is not durable. Its data goes when you delete the Pod or it moves to another node.
- The reclaim policy is on the PV, not the PVC. Set `reclaimPolicy` on the StorageClass before you need it.
- `hostPath` breaks portability. The Pod works only on nodes that have that path.

## The task

Write two YAML documents in `stub.yaml`, separated by a `---` line.

1. Document 1 is a PersistentVolumeClaim named `data-pvc`.
2. Its `accessModes` list has one entry: `ReadWriteOnce`.
3. Its `storageClassName` is `standard`.
4. It requests `storage: 10Gi`.
5. Document 2 is a Pod named `app`.
6. Its container `app` uses `image: app:1.0`.
7. The container mounts volume `cache` at `/cache`.
8. The container mounts volume `data` at `/data`.
9. Volume `cache` is `emptyDir: {}`.
10. Volume `data` uses the claim `data-pvc`.

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
