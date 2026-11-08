## What you build

You write a Deployment whose rollout never drops below full capacity and tests each new Pod for 10 seconds. The `strategy` field controls how new Pods replace old ones. This lesson builds on **Deployments**.

## Key concepts

### A rollout starts when `spec.template` changes

A new image, a new environment variable or any other change under `spec.template` starts a rollout. Wrong `maxSurge` or `maxUnavailable` values either overload the cluster or remove capacity under load.

```yaml
spec:
  minReadySeconds: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
```

### `RollingUpdate` replaces Pods in steps

`RollingUpdate` is the default. Old and new versions run together during the rollout. Tuned correctly, it causes no downtime. It is a built-in form of blue/green without a second full environment.

### `Recreate` stops all old Pods first

`Recreate` stops all old Pods before it creates new ones. Two versions never run together, but the service is down in between. Use it only when two versions cannot run at the same time. Examples are a schema-incompatible database migration, or a singleton that cannot have two writers.

### Both versions serve traffic during a rolling update

Your app must accept two versions at the same time. Do not make breaking API or schema changes in the middle of a rollout.

### `maxSurge` and `maxUnavailable` set the limits

`maxSurge` is how many Pods above `replicas` the rollout can create. `maxUnavailable` is how many Pods below `replicas` the rollout can drop to. Each is an absolute number or a percentage of `replicas`. Both default to `25%`.

### A worked example

```
replicas: 10, maxSurge: 2,
maxUnavailable: 1
ceiling: 10 + 2 = 12 Pods
floor:   10 - 1 = 9 available
```

The rollout creates new Pods, waits until they are Ready, then removes old ones. Total Pods stay between 9 and 12, with never fewer than 9 available.

### `maxUnavailable: 0` keeps full capacity

The rollout must create each replacement before it removes an old Pod, so it needs `maxSurge` room. Capacity-sensitive production services use this setting.

### `minReadySeconds` tests each new Pod

A new Pod must stay Ready for this many seconds before the rollout counts it as available. Without it, a Pod that becomes Ready and then crash-loops does not slow the rollout. Half the fleet can be on the bad version before anyone notices. `minReadySeconds: 10` gives a crash-loop 10 seconds to show itself.

### A stuck rollout keeps the old Pods

A rollout stalls when new Pods never become Ready. Typical causes are a failing readiness probe, a bad image tag or a config error. `maxUnavailable` limits how many old Pods the rollout removes. The old Pods keep serving traffic, so the service stays up.

```
kubectl rollout status deployment/api
kubectl describe pod <new-pod>
kubectl rollout undo deployment/api
```

`kubectl rollout status` hangs on a stuck rollout. `kubectl rollout undo` sets `spec.template` back to the previous ReplicaSet revision. That is fast, because the old ReplicaSet still exists.

## Watch out

- Percentages round up for `maxSurge` and down for `maxUnavailable`. This matters with few replicas.
- With `replicas: 3`, `maxUnavailable: 25%` rounds down to 0. The rollout must surge first.
- `maxUnavailable` and `maxSurge` cannot both be 0. The API server rejects the Deployment.
- Do not use `Recreate` as the simple default. Use it only when two versions together are unsafe.

## The task

Write a Deployment in `stub.yaml` for an API service. It must keep full capacity during a rollout. It must test each new Pod for 10 seconds.

1. Set `apiVersion: apps/v1` and `kind: Deployment`.
2. Set `metadata.name` to `api`.
3. Set `spec.replicas` to `10` and `spec.minReadySeconds` to `10`.
4. Set `spec.strategy.type` to `RollingUpdate`.
5. Set `spec.strategy.rollingUpdate.maxSurge` to `2`.
6. Set `spec.strategy.rollingUpdate.maxUnavailable` to `0`.
7. Set `spec.selector.matchLabels` and `spec.template.metadata.labels` to `app: api`.
8. Add one container with `name: api` and `image: api:2.0`.
9. Give the container one port with `containerPort: 8080`.
10. Write the `strategy` block before the `template` block.

The file must match this content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 10
  minReadySeconds: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: api:2.0
          ports:
            - containerPort: 8080
```
