## What you build

You write a labeled, annotated Pod and a selector block that matches it. Kubernetes has no foreign keys: objects find each other by matching labels. This lesson builds on **Pods**.

## Key concepts

### Labels are identifying key/value metadata

You can query labels. Services find Pods by label, Deployments find their Pods by label, and NetworkPolicies choose Pods by label.

```yaml
metadata:
  labels:
    app: catalog
    tier: backend
    env: production
```

### Label keys and values have strict syntax

A key is an optional `prefix/` and a name. The name has 63 characters at most, and the DNS prefix has 253 at most. A value has 63 characters at most and can be empty. Both use alphanumerics, `-`, `_` and `.`, and start and end with an alphanumeric.

### Shared label keys help tools

Typical keys are `app`, `tier`, `env` and `version`. The community keys `app.kubernetes.io/name` and `app.kubernetes.io/instance` let tools such as Helm and dashboards rely on the same keys across charts.

### Annotations are metadata that you never search by

```yaml
metadata:
  annotations:
    description: "Catalog service backend"
    owner: "team-catalog"
    kubernetes.io/change-cause: "image v2"
```

Annotation values have no character rules and often hold JSON. The total size of all annotations on one object is 256 KiB at most. `kubectl apply` stores `last-applied-configuration` in an annotation. Tools such as cert-manager and ingress controllers keep structured config there.

### You cannot select by annotation

Selectors read labels only. If you must query a value, put it in a label.

### Equality-based selectors use `=` and `!=`

Services use this form, as a plain map of labels. On the command line, `kubectl -l` takes it too.

```
app=catalog
tier!=frontend
```

### Set-based selectors use `matchLabels` and `matchExpressions`

Deployments, ReplicaSets, Jobs, DaemonSets and NetworkPolicies support this form inside a `selector:` block.

```yaml
selector:
  matchLabels:
    app: catalog
    tier: backend
  matchExpressions:
    - key: env
      operator: In
      values: [production, staging]
    - key: tier
      operator: Exists
```

`matchLabels` is a short form of `In` expressions with one value each. The operators `In` and `NotIn` need `values`. `Exists` and `DoesNotExist` allow no `values`.

### Kubernetes ANDs every selector entry

An object must match every entry in both `matchLabels` and `matchExpressions`. The same selector for `kubectl get pods -l`:

```
env in (production,staging),tier=backend
```

### Kubernetes has no referential integrity

A selector that matches zero Pods is not an error. A Service with such a selector has empty endpoints and serves nothing. A SQL foreign key fails on insert, but a label typo fails silently.

## Watch out

- Do not put a commit SHA or free text in a label. Use an annotation. Long label values break tools that group by label.
- A selector mismatch fails silently. `app: catalog` does not match `app: catalog-v2`, and you get no error.
- Kubernetes ANDs selector entries. It never ORs them. For `tier: backend` OR `tier: worker`, use one `In` expression with both values.
- Two separate expressions on `tier` both have to match.

## The task

Write two YAML documents in `stub.yaml`, separated by a `---` line.

Document 1 is a Pod for a backend service:

1. Set `metadata.name` to `catalog`.
2. Add the labels `app: catalog`, `tier: backend` and `env: production`.
3. Add the annotations `description: "Catalog service backend"` and `owner: "team-catalog"`.
4. Add one container with `name: catalog` and `image: catalog:1.0`.

Document 2 is a standalone selector block. It has the shape that a Deployment uses, and it matches this Pod and others like it:

1. Put the top-level `selector:` key after the `---` line.
2. Set `selector.matchLabels` to `app: catalog` and `tier: backend`.
3. Add one `selector.matchExpressions` entry with `key: env` and `operator: In`.
4. Write its values on one line: `values: [production, staging]`.

The file must match this content:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: catalog
  labels:
    app: catalog
    tier: backend
    env: production
  annotations:
    description: "Catalog service backend"
    owner: "team-catalog"
spec:
  containers:
    - name: catalog
      image: catalog:1.0

---
selector:
  matchLabels:
    app: catalog
    tier: backend
  matchExpressions:
    - key: env
      operator: In
      values: [production, staging]
```
