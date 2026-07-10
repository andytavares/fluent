# Deployments

## What you'll learn

A bare Pod has no self-healing behavior — if its node dies, nothing notices
or replaces it. A Deployment is the controller that turns Pods into a
durable, declarative, scalable workload: you describe the desired state
("3 replicas of this Pod template"), and a control loop continuously
reconciles reality toward it. This lesson builds the Deployment manifest
you'll actually use for almost every stateless workload you ship.

## Key concepts

**Deployment → ReplicaSet → Pods.** You never write a ReplicaSet by hand — a
Deployment creates and manages one for you, and the ReplicaSet is what
actually creates the Pods. This extra layer is what gives you rollouts:
each change to the Pod template creates a *new* ReplicaSet, and the
Deployment shifts Pods from the old ReplicaSet to the new one (mechanics
covered in the next lesson).

**Minimal Deployment:**

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

- `spec.replicas` — desired Pod count. The Deployment controller reconciles
  toward this number continuously, not just at creation.
- `spec.selector.matchLabels` — **the contract that binds the Deployment to
  its Pods.** This must be a subset of `spec.template.metadata.labels`.
- `spec.template` — a full Pod spec (everything you learned in the Pods
  lesson) embedded as the blueprint for every replica. This *is* a
  `PodTemplateSpec` — same `metadata` + `spec` shape as a standalone Pod.
- `spec.revisionHistoryLimit` — how many old ReplicaSets Kubernetes retains
  for rollback (default 10). Each one is basically free (metadata only, no
  running Pods), so there's rarely a reason to set this below 3–5.

## The `selector` / `template.labels` contract — the gotcha

`spec.selector` is **immutable after creation** and must match
`spec.template.metadata.labels`. Two ways this bites people:

1. **Selector doesn't match the template labels at all** — the API server
   rejects the Deployment outright with a validation error
   (`selector does not match template labels`).
2. **You try to change `spec.selector` on an existing Deployment** — the API
   server rejects the update. If you need to change the selector, you must
   delete and recreate the Deployment (or use `--cascade=orphan` to keep the
   Pods running under a new Deployment during migration).

The safe pattern: pick your `app`/`tier` labels once, put them in both
`selector.matchLabels` and `template.metadata.labels`, and never touch
`selector` again. Add extra labels to `template.metadata.labels` freely
(e.g. `version: v2`) — just don't add them to `selector.matchLabels` unless
you mean to permanently narrow what this Deployment owns.

## vs other tools

| | Deployment | Docker Swarm service | Bare Pod |
|---|---|---|---|
| Self-healing | Yes — controller loop | Yes — swarm manager | No |
| Declarative scaling | `replicas: N`, reconciled continuously | `--replicas N` | N/A (1 Pod) |
| Rolling updates | Built-in (`RollingUpdate` strategy) | Built-in | N/A |
| Rollback | `kubectl rollout undo`, revision history | Limited | N/A |

Coming from Swarm or ECS services, the concepts map closely — replicas,
rolling updates, rollback all exist in both. The main K8s-specific wrinkle is
the label-selector binding mechanism instead of an implicit service→task
relationship.

## Watch out

- **Never create bare Pods for anything long-running.** If a node is
  drained, rebooted, or dies, a bare Pod is gone forever; a Deployment
  notices the missing replica and schedules a new one elsewhere within
  seconds.
- **`selector` immutability surprises people mid-refactor.** Renaming
  `app: web` to `app: webapp` in `selector.matchLabels` on an existing
  Deployment will be rejected by the API server — plan label schemes before
  you ship the first version.
- **Every field under `template` is just a Pod spec.** If you already know
  how to write a Pod (previous lesson), you already know how to write
  `spec.template` — there's no new schema to learn here, only the wrapping
  Deployment fields (`replicas`, `selector`, `revisionHistoryLimit`,
  `strategy` — the last one is next lesson).

## The task

Write a Deployment manifest for a stateless web frontend:

- `apiVersion: apps/v1`, `kind: Deployment`
- `metadata.name: web`
- `spec.replicas: 3`
- `spec.revisionHistoryLimit: 5`
- `spec.selector.matchLabels`: `app: web`
- `spec.template.metadata.labels`: `app: web` (must match the selector
  exactly — this is the contract this lesson is teaching)
- `spec.template.spec.containers` with one container: `name: web`,
  `image: nginx:1.25`, one port with `containerPort: 8080`

Expected shape:

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
