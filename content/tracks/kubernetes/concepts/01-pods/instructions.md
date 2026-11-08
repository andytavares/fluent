## What you build

You write a complete Pod manifest in `stub.yaml`: one `nginx` container with a port, an environment variable and a restart policy. The Pod is the smallest unit that Kubernetes schedules, and every other workload creates Pods.

## Key concepts

### A Pod is one or more containers that share a network

Containers in one Pod share one IP address and one port space. They can share mounted volumes to exchange files. Kubernetes schedules them together on one node, and they start and stop as one unit.

```
Pod web (10.1.0.7)
  container app   listens on 8080
  container proxy calls localhost:8080
```

### Pods exist for multi-container patterns

A single container is a Pod with one member. The model supports sidecars that ship logs, init containers that prepare config, and service mesh proxies. Each of these needs `localhost` access to your app. A `docker run` container gets its own network namespace unless you join it by hand with `--network container:<id>`.

### A minimal Pod manifest has four top-level fields

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
    - name: web
      image: nginx:1.25
```

Pod is a core API object, so `apiVersion` is `v1`, not a group such as `apps/v1`. `metadata.name` must be a valid DNS subdomain: lowercase alphanumerics and `-`. `metadata.labels` holds key/value pairs for selection.

### `spec.containers` is a list

The field is a list, even for one container. Each entry needs at least `name` and `image`.

### `ports` is documentation, not enforcement

`containerPort` advertises the port that the container listens on. Tools such as Services and `kubectl describe` show it. Kubernetes does not block traffic to a port that you leave out.

```yaml
ports:
  - containerPort: 8080
```

### `env` sets variables for one container

`env` is a list of `name`/`value` pairs. Kubernetes injects them as environment variables into that container only. A later concept loads these values from ConfigMaps and Secrets.

```yaml
env:
  - name: APP_ENV
    value: "production"
```

### `restartPolicy` tells the kubelet what to do when a container exits

The values are `Always` (the default), `OnFailure` and `Never`. `OnFailure` restarts only after a non-zero exit, which is typical for Jobs. The Pod policy applies to all app containers and regular init containers. A Deployment allows only `Always`.

## Watch out

- A bare Pod does not heal itself. If its node fails, nothing creates it again.
- Production workloads use a controller, such as a Deployment, StatefulSet or Job. This concept uses a bare Pod only to show the smallest unit.
- A missing `ports` entry does not break traffic in the cluster. A missing Service does.
- `metadata.name` is unique per namespace and per kind. A Pod and a Service can both have the name `web`.

## The task

Write a Pod manifest in `stub.yaml`. A later monitoring sidecar builds on it.

1. Set `apiVersion: v1` and `kind: Pod`.
2. Set `metadata.name` to `web`.
3. Add the label `app: web` under `metadata.labels`.
4. Add exactly one container under `spec.containers`, with `name: web` and `image: nginx:1.25`.
5. Give the container one `ports` entry with `containerPort: 8080`.
6. Give the container one `env` entry with `name: APP_ENV` and `value: "production"`.
7. Set `spec.restartPolicy` to `Always`.

The file must match this content:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
    - name: web
      image: nginx:1.25
      ports:
        - containerPort: 8080
      env:
        - name: APP_ENV
          value: "production"
  restartPolicy: Always
```
