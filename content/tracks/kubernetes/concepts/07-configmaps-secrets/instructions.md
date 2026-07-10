# ConfigMaps & Secrets

## What you'll learn

Hardcoding config and credentials into a container image means rebuilding
the image for every environment and every credential rotation. ConfigMaps
and Secrets decouple configuration from the image: same image, different
config injected at deploy time. This lesson covers both objects, the three
ways to consume them, and the base64 misconception that catches almost
everyone once.

## Key concepts

**ConfigMap** — plain-text key/value config, no special handling:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: true
data:
  LOG_LEVEL: "info"
  FEATURE_X: "enabled"
```

`immutable: true` (GA since 1.21) tells the API server to reject any update
to `data`/`binaryData` — attempting one is an error, not a silent no-op.
This buys two things: the kubelet stops watching this object for changes
(lower apiserver load at scale), and you get a hard guarantee nobody
mutated shared config out from under a running Deployment. The trade-off:
to change a value, you create a *new* ConfigMap (commonly suffixed with a
content hash, e.g. `app-config-a1b2c3`) and update the Pod template to
reference it — which is exactly the *rollout-on-change* pattern below.

**Secret** — same shape as ConfigMap, but with two differences: values are
stored as base64 under `data`, and the object is typed:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: czNjcjN0        # base64("s3cr3t")
stringData:
  API_KEY: "plaintext-key-here"
```

- `data` — values must already be base64-encoded strings. `stringData` — a
  write-only convenience field: put plaintext in, and the API server
  base64-encodes it into `data` for you on write. You'll see both in the
  wild; `stringData` is friendlier for hand-authored manifests, `data` is
  what tooling (`kubectl create secret`, Helm) usually produces.
- `type: Opaque` is the generic type (arbitrary key/value). Kubernetes also
  defines structured types like `kubernetes.io/tls` (expects `tls.crt` +
  `tls.key`) and `kubernetes.io/dockerconfigjson` (registry credentials) that
  some controllers validate against.

**Base64 is encoding, not encryption.** `echo czNjcjN0 | base64 -d` recovers
`s3cr3t` instantly — no key required. A Secret object is *not* cryptographically
protected at rest by default; anyone who can `kubectl get secret -o yaml` or
read the underlying etcd data can read it. Real protection requires
encryption at rest for etcd (a cluster-level admin config, not something you
set per-Secret) and tight RBAC on `get`/`list` for `secrets` (covered in the
RBAC lesson). Treat "it's a Secret object" as an access-control label, not a
cryptographic guarantee.

**Three ways to consume either object in a Pod:**

```yaml
spec:
  containers:
    - name: app
      image: app:1.0
      envFrom:
        - configMapRef:
            name: app-config
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

- **`envFrom`** — dumps *every* key in the ConfigMap/Secret as an env var.
  Fast to wire up; also means an unrelated key added later silently becomes
  a new env var in your container — no filtering.
- **`env` + `valueFrom.configMapKeyRef`/`secretKeyRef`** — pulls exactly one
  named key as one named env var. More verbose, but explicit and safe when
  you only want a subset, or need to rename a key on the way in.
- **Volume mount** — each key becomes a *file* in the mount directory (file
  name = key, contents = value). Required for anything that expects a
  config file on disk rather than an env var (TLS certs, `nginx.conf`,
  `application.yaml`). Volume-mounted ConfigMaps/Secrets **update
  automatically** (via kubelet sync, typically within ~60s) when the
  underlying object's `data` changes — env vars from `envFrom`/`env` do
  **not** update in a running container; you must restart the Pod.

## Rollout-on-change pattern

Because env vars don't hot-reload and `immutable: true` blocks in-place
edits anyway, the standard pattern is to force a new rollout whenever config
changes: hash the ConfigMap's contents into an annotation on the Pod
template so a config-only change still produces a new template (and
therefore a rollout):

```yaml
spec:
  template:
    metadata:
      annotations:
        checksum/config: "a1b2c3..."   # recomputed by CI/CD from the ConfigMap's contents
```

Since the annotation lives under `template.metadata`, changing it alone
triggers a normal rolling update — no different from changing the image tag.

## vs other tools

| | ConfigMap/Secret | `.env` file | Vault/SSM | Docker Compose `environment:` |
|---|---|---|---|---|
| Decoupled from image | Yes | Yes (if not baked into image) | Yes | Yes |
| Encrypted at rest | Only if etcd encryption is enabled cluster-wide | No | Yes, by design | No |
| Dynamic secret rotation | No (built-in) — needs external tooling | No | Yes, native | No |
| Access control | RBAC on the Secret/ConfigMap object | Filesystem permissions | Fine-grained policies | None |

Kubernetes Secrets are a storage/delivery mechanism, not a secrets-management
platform — teams with real rotation/audit requirements typically layer
Vault, AWS Secrets Manager, or External Secrets Operator on top, syncing
into Kubernetes Secrets rather than hand-authoring them.

## Watch out

- **`stringData` is write-only** — reading the Secret back
  (`kubectl get secret -o yaml`) always shows `data` (base64), never
  `stringData`, even if that's what you wrote.
- **`immutable: true` + trying to `kubectl apply` a changed `data` block
  fails outright** — this is by design, not a bug; create a new object.
- **Volume-mounted updates are eventually-consistent, not instant** — don't
  assume a ConfigMap edit is visible to the Pod the instant `kubectl apply`
  returns.
- **`envFrom` has no allowlist** — auditing "what env vars does this
  container actually get" requires reading the referenced ConfigMap/Secret,
  not just the Pod spec.

## The task

Produce three YAML documents separated by `---`.

**Document 1** — an immutable ConfigMap:

- `apiVersion: v1`, `kind: ConfigMap`, `metadata.name: app-config`
- `immutable: true`
- `data`: `LOG_LEVEL: "info"`, `FEATURE_X: "enabled"`

**Document 2** — a Secret:

- `apiVersion: v1`, `kind: Secret`, `metadata.name: app-secret`
- `type: Opaque`
- `data.DB_PASSWORD: czNjcjN0` (already base64-encoded — this is
  base64("s3cr3t"))
- `stringData.API_KEY: "plaintext-key-here"`

**Document 3** — a Pod that consumes both, exercising all three
consumption patterns:

- `apiVersion: v1`, `kind: Pod`, `metadata.name: app`
- one container `name: app`, `image: app:1.0`
- `envFrom` with one entry: `configMapRef.name: app-config`
- `env` with one entry: `name: DB_PASSWORD`,
  `valueFrom.secretKeyRef.name: app-secret`,
  `valueFrom.secretKeyRef.key: DB_PASSWORD`
- `volumeMounts` with one entry: `name: config-volume`,
  `mountPath: /etc/config`
- `spec.volumes` with one entry: `name: config-volume`,
  `configMap.name: app-config`

Expected shape:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: true
data:
  LOG_LEVEL: "info"
  FEATURE_X: "enabled"

---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: czNjcjN0
stringData:
  API_KEY: "plaintext-key-here"

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: app:1.0
      envFrom:
        - configMapRef:
            name: app-config
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```
