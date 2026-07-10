# Services

## What you'll learn

Pods are ephemeral — they get new IPs every time they're recreated by a
rollout, a node failure, or a scale event. A Service is a stable network
identity in front of a *changing* set of Pods, found via the label selectors
you learned two lessons ago. This lesson covers the four Service types and
the port model that trips up almost everyone the first time.

## Key concepts

**How a Service finds its Pods:** a Service's `spec.selector` is matched
against Pod labels exactly like the selectors you already know. Kubernetes
maintains an `Endpoints` (or `EndpointSlice`) object listing the IP:port of
every currently-matching, Ready Pod — this list updates automatically as
Pods come and go. The Service's ClusterIP is a virtual address; `kube-proxy`
(or the CNI's equivalent) rewrites traffic to it toward one of the real Pod
IPs in the Endpoints list.

**Four Service types:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP        # default
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
```

- **`ClusterIP`** (default) — internal-only virtual IP, reachable from
  inside the cluster. The building block every other type is layered on.
- **`NodePort`** — additionally opens a port (30000–32767 by default) on
  *every* node's IP, forwarding to the ClusterIP. Crude but works without any
  cloud integration.
- **`LoadBalancer`** — additionally provisions a cloud load balancer (ELB,
  GCLB, etc.) pointing at the NodePort. Requires a cloud controller manager
  that implements it — on bare-metal clusters without one (e.g. MetalLB),
  the `EXTERNAL-IP` stays `<pending>` forever.
- **`ExternalName`** — no selector, no proxying at all. Returns a `CNAME`
  DNS record pointing at an external hostname:
  `spec: { type: ExternalName, externalName: legacy-db.example.com }`. Pure
  DNS aliasing — no Endpoints, no port mapping, works purely at the DNS
  layer.

**The three ports, precisely:**

- `port` — the port the *Service* listens on (what other Pods in the
  cluster connect to: `web.default.svc.cluster.local:80`).
- `targetPort` — the port on the *Pod* traffic is forwarded to. Can differ
  from `port` (Service on 80, container listening on 8080, as above) or be
  omitted (defaults to equal `port`).
- `nodePort` — (NodePort/LoadBalancer types only) the port opened on every
  node's host IP. If omitted, Kubernetes allocates one from the
  30000–32767 range.

**Headless Services** (`clusterIP: None`) skip the virtual-IP layer
entirely. DNS resolution of a headless Service's name returns the Pod IPs
directly (one A record per Ready Pod) instead of a single load-balanced VIP:

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

Use headless Services when clients need to address *individual* Pods rather
than "any one of them" — the canonical case is a StatefulSet member with a
stable identity (next-but-one lesson), where clients need to reach
`db-0.db.default.svc.cluster.local` specifically, not a random replica.

## vs other tools

| | Kubernetes Service | AWS ELB/ALB target group | DNS round-robin |
|---|---|---|---|
| Membership tracking | Automatic via label selector + Endpoints | Manual registration or ASG hook | Manual record management |
| Internal-only option | `ClusterIP` | Internal ALB (separate resource) | N/A |
| Per-instance addressing | Headless Service (`clusterIP: None`) | Not typical | Yes, if you manage records per host |
| Health-aware | Yes — only Ready Pods are in Endpoints | Yes — health checks | No |

The Endpoints-list mechanism is the key idea to internalize: a Service is
never "a load balancer with a config file" — it's a live query result over
Pod labels, refreshed continuously by the control plane.

## Watch out

- **`port` vs `targetPort` confusion is the #1 "service not reachable"
  bug.** If your container listens on 8080 but you set `targetPort: 80` (or
  omit it, defaulting to match `port: 80`), every request 502s or times out
  — the Service is healthy, the Pods are healthy, but nothing is listening
  on the port the Service forwards to.
- **A Service with a selector matching zero Pods is not an error.** It
  creates successfully with an empty `Endpoints` list and silently drops all
  traffic. Always cross-check `spec.selector` against your Deployment's
  `template.metadata.labels`.
- **`LoadBalancer` on a cluster with no cloud integration hangs at
  `<pending>` forever** — not a bug, just nothing implementing that
  Service type. Use `NodePort` or an Ingress controller (next lesson)
  instead in that environment.

## The task

Produce two YAML documents separated by `---`.

**Document 1** — a `ClusterIP` Service exposing the `web` Deployment from
earlier lessons:

- `apiVersion: v1`, `kind: Service`
- `metadata.name: web`
- `spec.type: ClusterIP`
- `spec.selector`: `app: web`
- `spec.ports` with one entry: `port: 80`, `targetPort: 8080`

**Document 2** — a headless Service for a database StatefulSet's Pods:

- `apiVersion: v1`, `kind: Service`
- `metadata.name: db`
- `spec.clusterIP: None`
- `spec.selector`: `app: db`
- `spec.ports` with one entry: `port: 5432`

Expected shape:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080

---
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
