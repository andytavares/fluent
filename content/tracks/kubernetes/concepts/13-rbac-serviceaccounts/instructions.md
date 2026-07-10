# RBAC & ServiceAccounts

## What you'll learn

Every request to the Kubernetes API — from `kubectl`, from a controller,
from your own Pod calling the API to discover its peers — is authenticated
as *someone* and authorized against *some* set of permissions. For
human users that's usually a cert or OIDC token; for a Pod calling the API
from inside the cluster, it's a **ServiceAccount**. This lesson covers how
Pods get API credentials at all, and the Role/RoleBinding objects that scope
what those credentials can do.

## Key concepts

**ServiceAccount — an identity for Pods, not people.**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
```

Every namespace has a `default` ServiceAccount automatically; any Pod that
doesn't set `serviceAccountName` uses it. That default account normally has
**no permissions at all** (empty by default in modern clusters) — which is
correct, and why you create a dedicated ServiceAccount per workload that
actually needs API access rather than granting permissions to `default`
(that would leak elevated access to every Pod in the namespace that didn't
ask for it).

A Pod that uses a ServiceAccount gets a projected, auto-rotated token
mounted at `/var/run/secrets/kubernetes.io/serviceaccount/token` — this is
what any in-cluster client library (`client-go`, `kubernetes` Python
client) picks up automatically to authenticate its own API calls.

**Role / ClusterRole — what actions are permitted.** Same shape, different
scope: a `Role` grants permissions within **one namespace**; a `ClusterRole`
grants permissions **cluster-wide** (or is reusable across namespaces via a
`RoleBinding` that references it).

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
```

- `apiGroups` — `""` means the **core** API group (Pods, Services,
  ConfigMaps, Secrets, Namespaces, Nodes — anything under `/api/v1`).
  Everything else has an explicit group: `apps` (Deployments,
  StatefulSets), `batch` (Jobs, CronJobs), `networking.k8s.io`
  (Ingress, NetworkPolicy), `rbac.authorization.k8s.io` (Role,
  RoleBinding) — check `kubectl api-resources` for the full mapping.
- `resources` — the plural, lowercase resource name (`pods`, not `Pod`).
- `verbs` — `get`, `list`, `watch`, `create`, `update`, `patch`, `delete`,
  `deletecollection`. `list`/`watch` without `get` lets you enumerate
  objects but is subtly different from being able to fetch one directly by
  name in some tooling — grant both together in practice.

**RoleBinding / ClusterRoleBinding — who gets that Role.**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
subjects:
  - kind: ServiceAccount
    name: pod-reader
    namespace: default
roleRef:
  kind: Role
  name: pod-reader-role
  apiGroup: rbac.authorization.k8s.io
```

`subjects` lists who's granted the permission — a `ServiceAccount`,
`User`, or `Group`. `roleRef` names the Role/ClusterRole being bound; it's
immutable once created (to change which role a binding grants, delete and
recreate the binding, same immutability rule as a Deployment's selector).

**The four-way combination that matters in practice:** a `RoleBinding` can
reference a `ClusterRole` — this is the standard way to define one reusable
permission set (e.g. "view pods") once as a ClusterRole, then grant it
per-namespace via lightweight RoleBindings, instead of duplicating the same
`rules` block as a Role in every namespace.

## Least-privilege patterns

- **One ServiceAccount per workload that needs API access**, not a shared
  one across unrelated Pods — blast radius of a compromised Pod is scoped
  to exactly what that one ServiceAccount can do.
- **Prefer `Role` + `RoleBinding` (namespace-scoped) over `ClusterRole` +
  `ClusterRoleBinding`** unless the workload genuinely needs cross-namespace
  or cluster-scoped access (e.g. a controller watching all namespaces).
- **Grant the narrowest verb set that works** — `get`/`list`/`watch` for a
  read-only controller, not `*`. Avoid `resources: ["*"]` and
  `verbs: ["*"]` outside of cluster-admin tooling.
- **Never bind permissions to the `default` ServiceAccount** — always
  create and reference a dedicated one so unrelated Pods in the namespace
  don't inherit access they never asked for.

## vs other tools

| | Kubernetes RBAC | AWS IAM | Unix file permissions |
|---|---|---|---|
| Identity for workloads | ServiceAccount | IAM role (via IRSA/instance profile) | UID/GID of the running process |
| Permission grant | Role/ClusterRole (verbs × resources) | IAM policy (actions × resources) | rwx bits |
| Binding | RoleBinding/ClusterRoleBinding | Role attachment/assume-role | File ownership |
| Scope | Namespace or cluster | Account or resource-level | Filesystem path |

The verb/resource/apiGroup model maps closely to an IAM policy's
action/resource shape — if you've written least-privilege IAM policies,
RBAC rules will feel familiar, just YAML instead of JSON policy documents.

## Watch out

- **`roleRef` is immutable** — you cannot repoint an existing RoleBinding at
  a different Role; delete and recreate it.
- **A ClusterRole bound via a namespaced RoleBinding only grants access
  within that RoleBinding's namespace** — the ClusterRole itself doesn't
  make the grant cluster-wide; only a `ClusterRoleBinding` does that. This
  is the #1 point of confusion between the two binding types.
- **`resources: ["pods"]` is case-sensitive and must be plural/lowercase**
  — `"Pod"` or `"Pods"` (capitalized) silently matches nothing.
- **The default ServiceAccount token is still mounted even if you never
  reference it** — if a Pod doesn't need API access at all, set
  `automountServiceAccountToken: false` to avoid handing out a credential
  the workload never uses.

## The task

Produce four YAML documents separated by `---`, wiring a Pod up with
least-privilege read-only access to Pods in its namespace.

**Document 1** — ServiceAccount:

- `apiVersion: v1`, `kind: ServiceAccount`, `metadata.name: pod-reader`

**Document 2** — Role:

- `apiVersion: rbac.authorization.k8s.io/v1`, `kind: Role`,
  `metadata.name: pod-reader-role`
- `rules` with one entry: `apiGroups: [""]`, `resources: ["pods"]`,
  `verbs: ["get", "list", "watch"]`

**Document 3** — RoleBinding:

- `apiVersion: rbac.authorization.k8s.io/v1`, `kind: RoleBinding`,
  `metadata.name: pod-reader-binding`
- `subjects` with one entry: `kind: ServiceAccount`, `name: pod-reader`,
  `namespace: default`
- `roleRef`: `kind: Role`, `name: pod-reader-role`,
  `apiGroup: rbac.authorization.k8s.io`

**Document 4** — a Pod using this identity:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: watcher`
- `spec.serviceAccountName: pod-reader`
- one container: `name: watcher`, `image: watcher:1.0`

Expected shape:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
subjects:
  - kind: ServiceAccount
    name: pod-reader
    namespace: default
roleRef:
  kind: Role
  name: pod-reader-role
  apiGroup: rbac.authorization.k8s.io

---
apiVersion: v1
kind: Pod
metadata:
  name: watcher
spec:
  serviceAccountName: pod-reader
  containers:
    - name: watcher
      image: watcher:1.0
```
