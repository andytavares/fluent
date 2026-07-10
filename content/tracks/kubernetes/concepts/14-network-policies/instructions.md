# Network Policies

## What you'll learn

By default, every Pod in a Kubernetes cluster can talk to every other Pod —
there is no network isolation unless you build it. NetworkPolicy is the
object that adds firewall-like rules scoped by label selectors instead of
IP addresses. This lesson covers the default-allow reality, the standard
deny-all baseline pattern, and the three ways to select traffic sources
and destinations.

## Key concepts

**Default-allow is the starting reality.** With no NetworkPolicy objects at
all, a Pod accepts traffic from anywhere in the cluster (and can send
traffic anywhere) — full mesh, zero isolation. NetworkPolicies are
**additive allow-lists**: once *any* NetworkPolicy selects a Pod for a given
direction (ingress or egress), that direction becomes **default-deny** for
that Pod, and only traffic matching some policy's rules is permitted.
Before that, it's wide open; there is no implicit deny.

**Requires a CNI that implements it.** Like Ingress needing a controller,
NetworkPolicy objects do nothing on a CNI plugin that doesn't enforce them
(the basic bridge/flannel setups often don't; Calico, Cilium, and most
managed cluster CNIs do). Creating the object always succeeds regardless —
verify enforcement actually happens in your specific cluster before relying
on it for security boundaries.

**The deny-all baseline** — the standard first policy in any namespace that
wants isolation:

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

`podSelector: {}` (empty) selects **every** Pod in the namespace.
`policyTypes` with no `ingress`/`egress` rules blocks means "for the listed
directions, deny everything not explicitly allowed elsewhere" — this
policy alone, with no `ingress:`/`egress:` blocks, denies all traffic in
both directions for every Pod in the namespace. You then layer specific
allow policies on top.

**A scoped allow policy** — narrowing back down after the baseline:

```yaml
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

- **`podSelector`** at the top level — which Pods this policy applies to
  (here, Pods labeled `app: api`).
- **`ingress[].from` / `egress[].to`** — the peer selectors, three kinds,
  combinable:
  - `podSelector` — Pods in the *same namespace* matching these labels.
  - `namespaceSelector` — all Pods in namespaces matching these labels
    (commonly matched on the built-in `kubernetes.io/metadata.name` label
    every namespace carries).
  - `ipBlock` — a raw CIDR range, for traffic to/from outside the cluster
    (or to a fixed subnet like a managed database).
- **`ports`** — restrict which ports/protocols are allowed; omitting
  `ports` under a rule allows all ports to the matched peers.
- **Multiple entries under one `from`/`to` list are ORed**; combining
  `podSelector` *and* `namespaceSelector` **inside the same list entry** is
  ANDed ("Pods with this label, in namespaces with that label") — a subtle
  but important distinction from putting them in separate list entries.

This example demonstrates the DNS-egress gotcha directly: because this
Pod's egress is now default-deny (it's selected by an Egress `policyType`),
it would lose DNS resolution entirely without that second `egress` rule
explicitly allowing UDP/53 to `kube-system` — a mistake that silently
breaks every outbound connection relying on service-name resolution, not
just the ones you meant to restrict.

## vs other tools

| | Kubernetes NetworkPolicy | Security Groups (AWS) | iptables (host-level) |
|---|---|---|---|
| Selection basis | Labels (Pods, namespaces) | Tags, CIDR, other SGs | IPs, interfaces, ports |
| Default posture | Allow, until any policy selects a Pod | Deny by default (inbound) | Deny/allow per your base chain policy |
| Enforcement point | CNI plugin (varies) | VPC networking layer | Kernel netfilter, per host |
| Cluster network churn | Handled automatically — Pods get new IPs constantly, policies match on labels | Manual instance/ENI tagging | Manual rule management |

The killer feature over IP-based firewalling: Pods get new IPs constantly
(every reschedule), so any IP-based rule set would need continuous
reconciliation. Label-based selection sidesteps that entirely — the policy
doesn't change when the Pods behind it do.

## Watch out

- **Enabling Egress `policyTypes` without an explicit DNS-allow rule breaks
  DNS resolution for the affected Pods** — this is the most common
  "everything mysteriously stopped working after I added a NetworkPolicy"
  incident. Always pair an egress-restricting baseline with a rule allowing
  UDP/TCP 53 to your DNS provider (usually `kube-system`).
  the `kube-system` namespace's DNS Pods.
- **A NetworkPolicy with no CNI enforcement is a no-op that looks correct**
  — `kubectl get networkpolicy` shows it happily created; nothing is
  actually being blocked. Verify your CNI enforces `NetworkPolicy` before
  treating it as a real boundary.
- **`podSelector: {}` under `spec` (top-level) means "all Pods"; an empty
  `from`/`to` list (or omitting it) under a rule means "all sources/
  destinations," which is different from omitting the rule entirely** (no
  rule at all = nothing allowed for that direction beyond what other
  policies grant).

## The task

Produce two YAML documents separated by `---`: a deny-all baseline, and a
scoped policy that allows the `api` Pods to receive traffic from `web`
Pods and reach a database subnet plus DNS.

**Document 1** — deny-all baseline:

- `apiVersion: networking.k8s.io/v1`, `kind: NetworkPolicy`,
  `metadata.name: deny-all`
- `spec.podSelector: {}`
- `spec.policyTypes`: `[Ingress, Egress]`

**Document 2** — scoped allow policy:

- `apiVersion: networking.k8s.io/v1`, `kind: NetworkPolicy`,
  `metadata.name: allow-api`
- `spec.podSelector.matchLabels`: `app: api`
- `spec.policyTypes`: `[Ingress, Egress]`
- `spec.ingress` with one rule: `from` a `podSelector.matchLabels: app: web`,
  `ports` one entry `protocol: TCP`, `port: 8080`
- `spec.egress` with two rules:
  - `to` an `ipBlock.cidr: 10.0.0.0/16`, `ports` one entry `protocol: TCP`,
    `port: 5432`
  - `to` a `namespaceSelector.matchLabels: kubernetes.io/metadata.name: kube-system`,
    `ports` one entry `protocol: UDP`, `port: 53`

Expected shape:

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
