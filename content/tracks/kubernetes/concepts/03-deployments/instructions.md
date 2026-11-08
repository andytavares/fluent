## What you build

You write a Deployment that runs 3 replicas of an `nginx` Pod. You state the desired state, and a control loop keeps the cluster at that state. This lesson builds on **Pods** and **Labels, Selectors & Annotations**.

## Key concepts

### A Deployment heals and scales Pods

A bare Pod has no self-healing. If its node fails, nothing replaces it. A Deployment notices the missing replica and schedules a new one on another node within seconds. Swarm and ECS services also have replicas, rolling updates and rollback, but bind tasks without labels.

### A Deployment manages a ReplicaSet, and the ReplicaSet creates the Pods

```
Deployment web
  ReplicaSet web-7d4b9 (revision 2)
    Pod, Pod, Pod
  ReplicaSet web-5c8f1 (revision 1, 0 Pods)
```

You never write a ReplicaSet by hand. Each change to the Pod template creates a new ReplicaSet. The Deployment moves Pods from the old ReplicaSet to the new one. The next concept covers that rollout.

### `spec.replicas` is the desired Pod count

The controller keeps the cluster at this number all the time, not only at creation.

```yaml
spec:
  replicas: 3
```

### `spec.template` is a full Pod spec

The template is a `PodTemplateSpec`: the same `metadata` and `spec` as a standalone Pod. If you can write a Pod, you can write the template. The new fields are the Deployment wrappers: `replicas`, `selector`, `revisionHistoryLimit` and `strategy`.

```yaml
template:
  metadata:
    labels:
      app: web
  spec:
    containers:
      - name: web
        image: nginx:1.25
```

### `spec.selector.matchLabels` binds the Deployment to its Pods

The selector must match `spec.template.metadata.labels`. If it does not, the API server rejects the Deployment with `selector does not match template labels`.

```yaml
selector:
  matchLabels:
    app: web
```

### `spec.selector` cannot change after creation

The API server rejects any update to the selector. To change it, delete and create the Deployment again. Use `--cascade=orphan` to keep the Pods running while a new Deployment takes them over.

### Choose selector labels once

Put your `app` and `tier` labels in both `selector.matchLabels` and `template.metadata.labels`. You can add more template labels, such as `version: v2`. Add a label to the selector only to narrow, permanently, what the Deployment owns.

### `spec.revisionHistoryLimit` keeps old ReplicaSets for rollback

The default is 10. An old ReplicaSet runs no Pods and holds only metadata, so a value below 3 to 5 is rarely useful.

## Watch out

- Do not run a long-running workload as a bare Pod. A drain, reboot or node failure removes it for good.
- Renaming `app: web` to `app: webapp` in an existing selector fails. Plan label names before the first release.
- A selector that does not match the template labels fails validation. The Deployment is never created.

## The task

Write a Deployment manifest in `stub.yaml` for a stateless web frontend.

1. Set `apiVersion: apps/v1` and `kind: Deployment`.
2. Set `metadata.name` to `web`.
3. Set `spec.replicas` to `3`.
4. Set `spec.revisionHistoryLimit` to `5`.
5. Set `spec.selector.matchLabels` to `app: web`.
6. Set `spec.template.metadata.labels` to `app: web`. It must match the selector exactly.
7. Write the `selector` block before the `template` block.
8. Add one container with `name: web` and `image: nginx:1.25`.
9. Give the container one port with `containerPort: 8080`.

The file must match this content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 8080
```
