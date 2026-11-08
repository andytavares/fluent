## What you build

You write a `ClusterIP` Service for the `web` Pods and a headless Service for database Pods. Pods get a new IP each time a rollout, node failure or scale event creates them. A Service gives a changing set of Pods one stable network identity. This lesson builds on **Labels, Selectors & Annotations** and **Deployments**.

## Key concepts

### A Service finds its Pods by label

The Service `spec.selector` matches Pod labels, as other selectors do. Kubernetes keeps an `Endpoints` or `EndpointSlice` object with the IP and port of each matching Ready Pod. The list updates when Pods start and stop.

### The ClusterIP is a virtual address

`kube-proxy`, or the CNI plugin's equivalent, sends traffic for the ClusterIP to one Pod IP from the endpoints list. A Service is a live query over Pod labels, not a load balancer with a static config. AWS target groups need manual or Auto Scaling registration instead.

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
```

### `ClusterIP` is the default type

It gives an internal virtual IP that only the cluster can reach. The other types build on it.

### `NodePort` opens a port on every node

The port comes from the range 30000–32767 by default. Traffic to that port on any node IP goes to the ClusterIP. It works without cloud integration.

### `LoadBalancer` asks for an external load balancer

The cloud creates a load balancer, such as an ELB or GCLB, that points at the NodePort. It needs a cloud controller manager or an implementation such as MetalLB. Without one, `EXTERNAL-IP` stays `<pending>` forever.

### `ExternalName` is a DNS alias

It has no selector, no proxy, no endpoints and no port mapping. DNS returns a `CNAME` record for an external hostname.

```yaml
spec:
  type: ExternalName
  externalName: legacy-db.example.com
```

### A Service has three port fields

- `port` is the port that the Service listens on, for example `web.default.svc.cluster.local:80`.
- `targetPort` is the port on the Pod. It can differ from `port`. If you leave it out, it equals `port`.
- `nodePort` is the port on every node, for `NodePort` and `LoadBalancer` only. If you leave it out, Kubernetes picks one from 30000–32767.

### A headless Service returns the Pod IPs

`clusterIP: None` removes the virtual IP. A DNS lookup of the Service name returns one A record per Ready Pod.

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

Use it when clients must reach one specific Pod, not any replica. The typical case is a StatefulSet member, such as `db-0.db.default.svc.cluster.local`. A later concept covers StatefulSets.

## Watch out

- A wrong `targetPort` is the top cause of an unreachable Service. Pods and Service look healthy, but nothing listens on that port.
- Example: the container listens on 8080, and `targetPort` is 80 or missing. Every request fails or times out.
- A selector that matches zero Pods is not an error. The Service has empty endpoints and drops all traffic.
- Compare `spec.selector` with the Deployment's `template.metadata.labels`.
- Without cloud integration, a `LoadBalancer` stays `<pending>` forever. Use `NodePort` or an Ingress controller there.

## The task

Write two Service manifests in `stub.yaml`, separated by a `---` line.

Document 1 exposes the `web` Pods inside the cluster:

1. Set `apiVersion: v1` and `kind: Service`.
2. Set `metadata.name` to `web` and `spec.type` to `ClusterIP`.
3. Set `spec.selector` to `app: web`.
4. Add one port entry with `port: 80` and `targetPort: 8080`.

Document 2 is a headless Service for the Pods of a database StatefulSet. It must come after the `---` line:

1. Set `apiVersion: v1` and `kind: Service`.
2. Set `metadata.name` to `db` and `spec.clusterIP` to `None`.
3. Set `spec.selector` to `app: db`.
4. Add one port entry with `port: 5432`.

The file must match this content:

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
