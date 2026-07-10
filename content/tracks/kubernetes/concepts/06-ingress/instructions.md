# Ingress

## What you'll learn

A Service gives you one stable endpoint per app. Real deployments usually
need to route many hostnames/paths, on port 443, with TLS termination, to
many different Services — without provisioning a separate cloud load
balancer for each one. Ingress is the API object that describes that
routing; an **Ingress controller** is the separate piece of software that
actually reads it and configures a reverse proxy (or cloud LB) accordingly.

## Key concepts

**Ingress requires a controller — the resource alone does nothing.**
Creating an Ingress object with no controller running in the cluster (no
ingress-nginx, no Traefik, no cloud-provider ALB controller) just sits there
inert; nothing watches it. Check `kubectl get ingressclass` to see what's
installed. This is the single most common "why doesn't my Ingress work"
issue for people new to the object.

**Anatomy of an Ingress:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
  defaultBackend:
    service:
      name: web
      port:
        number: 80
```

- **`ingressClassName`** — which controller should handle this Ingress
  (a cluster can run more than one, e.g. an internal and an external
  nginx-ingress). Without it, whichever controller is marked the cluster
  default picks it up (or nothing does, if there's no default).
- **`rules[].host`** — the Host header to match. Omit it to match any host.
- **`pathType`** — `Prefix` (matches `/api`, `/api/v1`, `/api/anything` —
  segment-aware, `/apiv2` does *not* match `/api`), `Exact` (matches the
  literal path only, no children), or `ImplementationSpecific` (controller
  decides — avoid unless you have a specific reason).
- **`tls[].hosts` + `secretName`** — terminates TLS for the listed hosts
  using a cert/key stored in a Secret of type `kubernetes.io/tls` (Secrets
  are next lesson). The controller handles the handshake; your backend Pods
  usually receive plain HTTP.
- **`defaultBackend`** — catches any request that matches no rule (wrong
  host, unmatched path). Without one, unmatched requests get the
  controller's own 404, which is fine, but a `defaultBackend` lets you serve
  a branded error page or a catch-all service instead.

## vs other tools

| | Kubernetes Ingress | nginx.conf / Apache vhost | Cloud ALB rules |
|---|---|---|---|
| Config format | Declarative K8s object | Imperative config file | Console/Terraform rules |
| Requires separate controller | Yes — the resource is inert alone | No — nginx *is* the proxy | No — ALB *is* the LB |
| Multi-tenant routing | Host + path rules across many Services | vhost blocks | Listener rules |
| TLS termination | `tls:` block + Secret | `ssl_certificate` directives | ACM cert attached to listener |

The conceptual leap for people coming from hand-rolled nginx: you're not
writing the proxy config directly — you're writing a spec that a controller
*compiles into* a proxy config (usually still nginx.conf under the hood).
Direct nginx-specific tuning goes through controller-specific annotations,
not the portable `spec.rules` fields.

## Watch out

- **`path: /api` with `pathType: Prefix` matches `/apiv2` in some naive
  mental models but not in Kubernetes** — Prefix matching is
  path-element-aware (`/api/`, `/api`, `/api/x` match; `/apiv2` does not).
- **Multiple Ingress objects can target the same host** — most controllers
  merge rules across all Ingress objects for that host, which can produce
  surprising precedence if two teams both claim `path: /`. Check your
  controller's conflict-resolution docs (usually longest-path-wins).
- **No `ingressClassName` and no default IngressClass configured** means the
  Ingress is created but never picked up by any controller — `kubectl get
  ingress` shows it with no `ADDRESS`, forever.
- **TLS secret must exist and be of type `kubernetes.io/tls`** with `tls.crt`
  and `tls.key` keys — a missing or wrong-shaped Secret makes the controller
  fall back to a self-signed cert or fail the handshake, depending on
  implementation.

## The task

Write an Ingress for an API gateway that terminates TLS and routes `/api` to
a backend service, with a fallback for anything else:

- `apiVersion: networking.k8s.io/v1`, `kind: Ingress`
- `metadata.name: web`
- `spec.ingressClassName: nginx`
- `spec.tls` with one entry: `hosts: [api.example.com]`,
  `secretName: api-tls`
- `spec.rules` with one entry: `host: api.example.com`, one HTTP path:
  `path: /api`, `pathType: Prefix`, backing service `name: api`, `port.number: 80`
- `spec.defaultBackend.service.name: web`, `port.number: 80`

Expected shape:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
  defaultBackend:
    service:
      name: web
      port:
        number: 80
```
