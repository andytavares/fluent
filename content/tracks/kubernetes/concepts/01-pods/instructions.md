# Pods

## What you'll learn

The Pod is the atomic unit Kubernetes schedules — not the container. Every
other workload object (Deployment, StatefulSet, Job) is ultimately a machine
that stamps out Pods. If you don't understand what a Pod actually is — what
it shares, what it isolates, and why it exists as a layer above "container" —
everything built on top of it (rollouts, probes, resource limits) will feel
arbitrary. By the end of this lesson you'll write a complete, correct Pod
manifest from scratch.

## Key concepts

**A Pod is one or more containers that share a network namespace, IPC
namespace, and (optionally) volumes.** Containers in the same Pod:

- Share one IP address and port space — `localhost:8080` in one container
  reaches port 8080 in another container in the same Pod.
- Can share mounted volumes to exchange files.
- Are always scheduled together, on the same node, and live and die together
  as a unit — you cannot schedule half a Pod.

This is why a Pod is not "just a container with extra YAML." A single
container *is* effectively a Pod with one member, but the model exists to
support **multi-container patterns** — a sidecar shipping logs, an init
container preparing config, a service mesh proxy — all of which need
localhost-level access to your app's container. Docker Compose's "service"
and a raw `docker run` don't have this notion of a shared network sandbox
between otherwise-independent containers.

**Minimal Pod spec:**

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

Field by field:

- `apiVersion: v1` — Pod is a core API object, not part of a versioned group
  like `apps/v1`.
- `metadata.name` — must be a valid DNS subdomain (lowercase, alphanumeric,
  `-`). `metadata.labels` — key/value pairs used for selection (covered in
  depth next lesson).
- `spec.containers` — a **list**, even for a single container. Each entry
  needs at least `name` and `image`.
- `ports` — this is *documentation*, not enforcement. Kubernetes does not
  block traffic to ports you didn't declare here; `containerPort` just
  advertises what the container listens on so other tooling (Services,
  `kubectl describe`) can show it.
- `env` — a list of `name`/`value` pairs injected as environment variables
  into that specific container. (Later lessons cover pulling these from
  ConfigMaps/Secrets instead of inlining values.)
- `restartPolicy` — governs what the kubelet does when a container in the
  Pod exits. `Always` (default, and the only legal value for Deployments),
  `OnFailure` (restart only on non-zero exit — typical for Jobs), or `Never`.
  This applies to every container in the Pod; you cannot mix policies across
  containers in the same Pod.

## vs other tools

| | Kubernetes Pod | `docker run` container | Docker Compose service |
|---|---|---|---|
| Scheduling unit | Pod (1+ containers) | Single container | Single container (per replica) |
| Shared network by default | Yes, across containers in a Pod | No — each container gets its own netns unless joined manually | Yes, across the whole compose project via a bridge network |
| Multi-container coupling | First-class (sidecars, init containers) | Manual (`--network container:<id>`) | Loose — services are still independently addressable, not localhost-shared |
| Restart semantics | `restartPolicy` per Pod, enforced by kubelet | `--restart` flag, enforced by Docker daemon | `restart:` key, enforced by Compose |

The key mental shift coming from `docker run`/Compose: in Kubernetes you
almost never think about "a container" as the deployable thing. You think
about "a Pod," and multi-container Pods (sidecars sharing localhost) are a
normal, first-class pattern rather than a hack.

## Watch out

- **You will almost never create a bare Pod in production.** Bare Pods are
  not self-healing — if the node dies, the Pod is gone for good; nothing
  recreates it. Every real workload goes through a controller (Deployment,
  StatefulSet, Job) that manages Pods for you. This lesson uses a bare Pod
  only because it's the smallest unit worth understanding in isolation — the
  next lesson introduces the controller that makes Pods durable.
- **`ports` is informational.** Forgetting it doesn't break connectivity
  within the cluster; forgetting the Service that routes to the Pod does
  (covered later).
- **One namespace, many resources.** `metadata.name` must be unique per
  namespace per resource *kind* — you can have a Pod and a Service both named
  `web` in the same namespace.

## The task

Write a single Pod manifest that a monitoring sidecar pattern would build on
later. Produce YAML with:

- `apiVersion: v1`, `kind: Pod`
- `metadata.name: web`
- `metadata.labels` containing `app: web`
- `spec.containers` with exactly one container:
  - `name: web`
  - `image: nginx:1.25`
  - `ports` containing one entry with `containerPort: 8080`
  - `env` containing one entry: `name: APP_ENV`, `value: "production"`
- `spec.restartPolicy: Always`

Example of the expected shape (fill in `stub.yaml` to match this exactly):

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
