# Labels, Selectors & Annotations

## What you'll learn

Kubernetes has no notion of "this Deployment owns that Pod" as a foreign-key
relationship. Instead, almost everything in the system finds everything else
by **matching labels**. Services find Pods this way. Deployments find their
ReplicaSet's Pods this way. NetworkPolicies decide who can talk to whom this
way. Get labels and selectors right and the rest of Kubernetes — which is
mostly "find the right set of Pods and do something to them" — becomes
predictable instead of magic.

## Key concepts

**Labels are identifying, queryable key/value metadata** attached to any
object:

```yaml
metadata:
  labels:
    app: catalog
    tier: backend
    env: production
```

Rules: keys are up to 253 chars (optional `prefix/` + name), values up to 63
chars, both restricted to alphanumerics, `-`, `_`, `.`. Labels are meant to be
short, structured, and *machine-queryable* — `app`, `tier`, `env`, `version`
are typical. The community convention `app.kubernetes.io/name`,
`app.kubernetes.io/instance`, etc. exists so tooling (Helm, dashboards) can
rely on consistent keys across charts you didn't author.

**Annotations are non-identifying metadata** — anything you want to attach to
an object that you'll never *search by*:

```yaml
metadata:
  annotations:
    description: "Catalog service backend"
    owner: "team-catalog"
    kubernetes.io/change-cause: "bump image to v2.3.1"
```

Annotations have no size restriction on values (labels are validated and
capped; annotations are free text, often holding JSON blobs — this is how
`kubectl apply` stores `last-applied-configuration`, and how tools like
cert-manager or ingress controllers stash structured config). **You cannot
select objects by annotation.** If you need to query by it, it belongs in a
label instead.

**Selectors — how one object finds a group of others.** Two syntaxes:

*Equality-based* (used with `kubectl -l` and older APIs):

```
app=catalog
tier!=frontend
```

*Set-based* (used inside a `selector:` block on Services, Deployments,
NetworkPolicies, etc. — via `matchLabels` + `matchExpressions`):

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

`matchLabels` is shorthand for a bunch of `In` expressions with one value
each. **Every entry in both `matchLabels` and `matchExpressions` is ANDed
together** — an object must satisfy all of them to match. Operators:
`In`, `NotIn` (require `values`), `Exists`, `DoesNotExist` (no `values`
allowed).

`kubectl get pods -l 'env in (production,staging),tier=backend'` is the CLI
equivalent of that selector block — same set-based logic, command-line
syntax.

## vs other tools

| | Kubernetes labels/selectors | SQL foreign keys | Tags (AWS/GCP) |
|---|---|---|---|
| Relationship model | Loose, queried at runtime | Strict, enforced by the DB | Loose, queried at runtime |
| Enforcement | None — a typo silently matches zero objects | FK constraint fails on insert | None |
| Multiple owners | Trivial — many objects can select the same labels | One FK, one parent | Trivial |
| Query language | Equality + set-based (`In`/`NotIn`/`Exists`) | Full SQL `WHERE` | Provider-specific, usually equality only |

The important mental shift: there's no referential integrity. A Service's
`selector` matching zero Pods is not an error — it's a Service with an empty
`Endpoints` list, silently serving nothing. Kubernetes will never tell you
"that label doesn't exist." This is the single most common source of "my
Service isn't routing traffic" bugs, and it starts right here with typos in
labels.

## Watch out

- **Labels are for identity, not information storage.** Don't put a commit
  SHA or a free-text description in a label just because it's convenient —
  use an annotation. Labels influence scheduling, selection, and grouping;
  bloating them with unbounded strings breaks tooling that lists/groups by
  label.
- **Selector mismatches fail silently.** `selector: {app: catalog}` selecting
  Pods labeled `app: catalog-v2` matches nothing — no error, no warning, just
  a Service or Deployment with zero matched Pods.
- **`matchLabels` + `matchExpressions` are ANDed, not ORed.** If you need OR
  semantics ("Pods labeled `tier: backend` OR `tier: worker`"), you need a
  single `In` expression with both values, not two separate expressions.

## The task

Produce two YAML documents separated by `---`.

**Document 1** — a Pod manifest for a backend service:

- `metadata.name: catalog`
- `metadata.labels`: `app: catalog`, `tier: backend`, `env: production`
- `metadata.annotations`: `description: "Catalog service backend"`,
  `owner: "team-catalog"`
- `spec.containers` with one container: `name: catalog`, `image: catalog:1.0`

**Document 2** — a standalone selector block (the same shape used inside a
Service or Deployment spec) that would match this Pod and others like it:

- `selector.matchLabels`: `app: catalog`, `tier: backend`
- `selector.matchExpressions`: one entry with `key: env`, `operator: In`,
  `values: [production, staging]`

Expected shape:

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
