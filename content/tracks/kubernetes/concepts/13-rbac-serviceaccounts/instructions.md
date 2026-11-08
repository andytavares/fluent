## What you build

You give a Pod read-only access to the Pods in its namespace, with a ServiceAccount, a Role and a RoleBinding. The API server authenticates every request and checks it against a set of permissions. This lesson builds on **Pods**.

## Key concepts

### A ServiceAccount is an identity for Pods

People usually authenticate with a certificate or an OIDC token. A Pod that calls the API from inside the cluster uses a ServiceAccount.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
```

Every namespace has a `default` ServiceAccount. A Pod that does not set `serviceAccountName` uses it. In modern clusters, `default` has no permissions. Create one ServiceAccount per workload that needs API access. A grant to `default` gives access to every Pod in the namespace.

The Pod gets a projected token that rotates automatically, at `/var/run/secrets/kubernetes.io/serviceaccount/token`. In-cluster client libraries, such as `client-go` and the `kubernetes` Python client, read it automatically.

### A Role lists the permitted actions

A `Role` grants permissions in one namespace. A `ClusterRole` has the same shape and grants permissions cluster-wide.

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

- `apiGroups: [""]` is the core group: everything under `/api/v1`, such as Pods, Services, ConfigMaps, Secrets, Namespaces and Nodes. Other resources have a named group: `apps`, `batch`, `networking.k8s.io` or `rbac.authorization.k8s.io`. `kubectl api-resources` shows the full map.
- `resources` uses the plural, lowercase name: `pods`, not `Pod`.
- `verbs` are `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` and `deletecollection`. Grant `get`, `list` and `watch` together for read access.

RBAC rules have the same action and resource shape as an AWS IAM policy, in YAML instead of JSON.

### A RoleBinding grants a Role to subjects

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

`subjects` lists who gets the permission: a `ServiceAccount`, a `User` or a `Group`. `roleRef` names the Role or ClusterRole. `roleRef` is immutable, like the selector of a Deployment.

### A RoleBinding can grant a ClusterRole in one namespace

Define a reusable permission set, such as "view pods", once as a ClusterRole. Then grant it per namespace with a RoleBinding. You do not copy the same `rules` into a Role in every namespace.

### Grant the least privilege

- Give each workload its own ServiceAccount. A compromised Pod can then do only what its ServiceAccount allows.
- Use `Role` and `RoleBinding`. Use `ClusterRole` and `ClusterRoleBinding` only for cluster-wide access, such as a controller that watches all namespaces.
- Grant the smallest verb set: `get`, `list` and `watch` for a read-only controller. Do not use `"*"` in `resources` or `verbs` outside cluster-admin tools.
- Do not bind permissions to the `default` ServiceAccount.

## Watch out

- `roleRef` is immutable. To point a RoleBinding at another Role, delete it and create it again.
- A ClusterRole in a RoleBinding grants access only in that namespace. Only a `ClusterRoleBinding` grants cluster-wide access.
- `resources` is case-sensitive. `"Pod"` or `"Pods"` matches nothing, with no error.
- Kubernetes mounts the token even when the Pod never uses it. Set `automountServiceAccountToken: false` for Pods with no API access.

## The task

Write four YAML documents in `stub.yaml`, separated by `---` lines. Together they give a Pod read-only access to Pods.

1. Document 1 is a ServiceAccount named `pod-reader`.
2. Document 2 is a Role named `pod-reader-role`.
3. The Role has one rule with `apiGroups: [""]` and `resources: ["pods"]`.
4. The rule has `verbs: ["get", "list", "watch"]`, in that flow form.
5. Document 3 is a RoleBinding named `pod-reader-binding`.
6. Its one subject is the ServiceAccount `pod-reader` in namespace `default`.
7. Its `roleRef` is `kind: Role`, `name: pod-reader-role`.
8. Its `roleRef` has `apiGroup: rbac.authorization.k8s.io`.
9. Document 4 is a Pod named `watcher` with `serviceAccountName: pod-reader`.
10. The Pod has one container `watcher` with `image: watcher:1.0`.

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
