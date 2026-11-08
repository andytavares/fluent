## What you build

You write a deny-all baseline and a policy that opens only the traffic the `api` Pods need. By default, every Pod can talk to every other Pod. This lesson builds on **Services** and **Labels, Selectors & Annotations**.

## Key concepts

### A Pod accepts all traffic until a policy selects it

With no NetworkPolicy, a Pod accepts traffic from anywhere in the cluster and can send traffic anywhere. NetworkPolicies are additive allow-lists. When any policy selects a Pod for a direction (ingress or egress), that direction becomes default-deny for the Pod. Only traffic that matches a rule of some policy can then pass.

### The CNI plugin enforces the policy

A NetworkPolicy does nothing without a CNI plugin that enforces it, like an Ingress without a controller. Calico, Cilium and most managed-cluster CNIs enforce it. Basic bridge and flannel setups often do not. The API server accepts the object in every case, so check enforcement in your cluster.

### An empty `podSelector` selects every Pod

The deny-all baseline is the first policy in a namespace that needs isolation.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

`podSelector: {}` selects every Pod in the namespace. The policy lists both directions in `policyTypes` but has no `ingress` or `egress` rules. It denies all traffic in both directions. You then add allow policies on top.

### Three kinds of peer select the traffic

The top-level `podSelector` picks the Pods that the policy applies to. Each rule names peers in `ingress[].from` or `egress[].to`:

- `podSelector` matches Pods in the same namespace by label.
- `namespaceSelector` matches all Pods in namespaces with the labels. Every namespace has the label `kubernetes.io/metadata.name`.
- `ipBlock` matches a CIDR range, for traffic outside the cluster or to a fixed subnet, such as a managed database.

```yaml
ingress:
  - from:
      - podSelector:
          matchLabels:
            app: web
    ports:
      - protocol: TCP
        port: 8080
```

`ports` limits the ports and protocols. A rule with no `ports` allows all ports to its peers.

### Separate entries OR, one entry ANDs

Kubernetes ORs two entries in one `from` or `to` list. It ANDs a `podSelector` and a `namespaceSelector` in the same entry: "Pods with this label, in namespaces with that label".

```yaml
# OR: two entries
- from:
    - podSelector: {...}
    - namespaceSelector: {...}
# AND: one entry
- from:
    - podSelector: {...}
      namespaceSelector: {...}
```

### Egress rules must allow DNS

When `policyTypes` lists `Egress`, the Pod loses DNS unless a rule allows port 53 to the DNS Pods in `kube-system`. Every connection by service name then fails, not only the connections you meant to block.

### Labels survive new Pod IPs

Pods get a new IP on every reschedule. A rule set based on IPs, such as AWS security groups or iptables, needs constant updates. A label-based policy stays the same when the Pods behind it change.

## Watch out

- An Egress policy with no DNS rule breaks name resolution. Allow UDP and TCP 53 to the DNS Pods in `kube-system`.
- A policy with no CNI enforcement blocks nothing. `kubectl get networkpolicy` still shows it.
- An empty `from` or `to` list allows all peers. A missing rule allows nothing beyond what other policies grant.

## The task

Write two NetworkPolicies in `stub.yaml`, separated by a `---` line. The first one denies all traffic. The second one lets the `api` Pods accept traffic from `web` Pods and reach a database subnet and DNS.

1. Document 1 is a NetworkPolicy named `deny-all`.
2. It has `podSelector: {}` and `policyTypes` `Ingress` and `Egress`.
3. Document 2 is a NetworkPolicy named `allow-api`.
4. It selects Pods with `app: api` and lists `Ingress` and `Egress`.
5. Its one ingress rule allows Pods with `app: web` on TCP port 8080.
6. Its first egress rule allows `ipBlock` `10.0.0.0/16` on TCP port 5432.
7. Its second egress rule allows UDP port 53 to the `kube-system` namespace.
8. Select that namespace with the label `kubernetes.io/metadata.name`.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/16
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
      ports:
        - protocol: UDP
          port: 53
```
