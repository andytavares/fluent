## What you build

You write an Ingress that terminates TLS, sends `/api` to one Service and sends everything else to another. One Ingress routes many hosts and paths to many Services, without a cloud load balancer per Service. This lesson builds on **Services**.

## Key concepts

### An Ingress needs a controller

The Ingress object describes the routes. An Ingress controller, such as ingress-nginx, Traefik or a cloud ALB controller, reads it and configures a proxy. Without a controller, nothing watches the Ingress and it does nothing. This is the most common cause of a broken Ingress.

```
kubectl get ingressclass
```

### A controller compiles the Ingress into proxy config

You do not write `nginx.conf` directly. You write a spec, and the controller turns it into proxy config, often `nginx.conf`. Tuning for one proxy goes in controller-specific annotations, not in the portable `spec.rules` fields.

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

### `ingressClassName` picks the controller

A cluster can run more than one controller, for example an internal and an external ingress-nginx. Without this field, the default IngressClass handles the Ingress. If there is no default, no controller does.

### `rules[].host` matches the Host header

Leave out `host` to match any host.

### `pathType` sets how paths match

- `Prefix` matches by path element. `/api` matches `/api`, `/api/` and `/api/v1`, but not `/apiv2`.
- `Exact` matches only the literal path.
- `ImplementationSpecific` lets the controller decide. Avoid it without a specific reason.

### `tls` terminates HTTPS

`tls[].hosts` lists the hosts. `secretName` names a Secret of type `kubernetes.io/tls` with the certificate and key. The controller does the TLS handshake, and the backend Pods usually get plain HTTP. A later concept covers Secrets.

### `defaultBackend` catches unmatched requests

It serves requests that match no rule, such as a wrong host or an unmatched path. Without it, the controller returns its own 404. Use it for a branded error page or a catch-all Service.

## Watch out

- `path: /api` with `pathType: Prefix` does not match `/apiv2`. Prefix matching works by path element.
- Most controllers merge the rules of all Ingress objects for one host. Two teams that both claim `path: /` get surprising precedence.
- Read your controller's conflict rules. The longest path usually wins.
- With no `ingressClassName` and no default IngressClass, no controller picks up the Ingress. `kubectl get ingress` shows no `ADDRESS` forever.
- The TLS Secret must exist, with type `kubernetes.io/tls` and keys `tls.crt` and `tls.key`.
- With a missing or wrong Secret, the controller uses a self-signed certificate or fails the handshake.

## The task

Write an Ingress in `stub.yaml` for an API gateway. It terminates TLS, routes `/api` to the `api` Service, and sends everything else to `web`.

1. Set `apiVersion: networking.k8s.io/v1` and `kind: Ingress`.
2. Set `metadata.name` to `web` and `spec.ingressClassName` to `nginx`.
3. Add one `spec.tls` entry with the host `api.example.com` and `secretName: api-tls`.
4. Add one `spec.rules` entry with `host: api.example.com`.
5. Give the rule one HTTP path: `path: /api` with `pathType: Prefix`.
6. Send that path to the Service `name: api` with `port.number: 80`.
7. Set `spec.defaultBackend` to the Service `name: web` with `port.number: 80`.
8. Write the `api` backend before the `defaultBackend` block.

The file must match this content:

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
