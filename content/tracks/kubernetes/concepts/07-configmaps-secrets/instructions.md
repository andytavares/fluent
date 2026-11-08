## What you build

You write an immutable ConfigMap, a Secret and a Pod that reads both in three ways. Config in the image means a new build for each environment and each credential rotation. ConfigMaps and Secrets let one image get different config at deploy time. This lesson builds on **Pods** and **Rollout Strategies**.

## Key concepts

### A ConfigMap holds plain-text key/value config

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

### `immutable: true` blocks every change to the data

The field is GA since Kubernetes 1.21. The API server rejects updates to `data` and `binaryData` with an error. The kubelet stops watching the object, which lowers API server load at scale. Nobody can change shared config under a running Deployment.

### To change an immutable ConfigMap, create a new one

Name the new ConfigMap with a content hash, for example `app-config-a1b2c3`. Then point the Pod template at it. That change starts a rollout.

### A Secret has a type and base64 values

A Secret has the same shape as a ConfigMap, with two differences. Values under `data` are base64, and the object has a `type`.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  # base64("s3cr3t")
  DB_PASSWORD: czNjcjN0
stringData:
  API_KEY: "plaintext-key-here"
```

### `data` takes base64 and `stringData` takes plain text

Values under `data` must already be base64 strings. `stringData` is write-only: the API server encodes its plain text into `data` on write. `stringData` is easier to write by hand. Tools such as `kubectl create secret` and Helm usually produce `data`.

### `type` tells controllers what keys to expect

`Opaque` is the generic type for any key/value pairs. Some controllers validate the structured types. `kubernetes.io/tls` expects `tls.crt` and `tls.key`. `kubernetes.io/dockerconfigjson` holds registry credentials.

### Base64 is an encoding, not encryption

`echo czNjcjN0 | base64 -d` prints `s3cr3t`, with no key. By default, anyone who can run `kubectl get secret -o yaml` or read etcd can read a Secret.

### Real protection needs encryption at rest and RBAC

A cluster admin turns on etcd encryption at rest for the whole cluster, not per Secret. Tight RBAC on `get` and `list` for `secrets` limits who reads them. A later concept covers RBAC. Treat a Secret as an access-control label, not a cryptographic guarantee.

### Secrets store config but do not manage it

Kubernetes Secrets have no built-in rotation. Teams with rotation or audit needs sync from Vault, AWS Secrets Manager or External Secrets Operator into Secrets.

### A Pod can read config in three ways

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

### `envFrom` loads every key

Each key in the ConfigMap or Secret becomes an environment variable. It is fast to set up, but has no filter. A key that someone adds later becomes a new variable in your container.

### `env` with `valueFrom` loads one key

`configMapKeyRef` or `secretKeyRef` loads one named key into one named variable. It is longer, but explicit. Use it for a subset of keys, or to rename a key.

### A volume mount turns each key into a file

The file name is the key, and the contents are the value. Use it for apps that read a config file, such as TLS certificates, `nginx.conf` or `application.yaml`.

### Only volume mounts update in a running Pod

The kubelet updates mounted files when the object's `data` changes, typically within about 60 seconds. Variables from `envFrom` and `env` do not change in a running container. You must restart the Pod.

### A checksum annotation starts a rollout on config change

Variables do not reload, and `immutable: true` blocks edits. So the usual pattern puts a hash of the ConfigMap contents in a Pod template annotation. A config-only change then changes the template, which starts a rolling update, as an image change does.

```yaml
spec:
  template:
    metadata:
      annotations:
        # CI/CD computes the hash
        checksum/config: "a1b2c3..."
```

## Watch out

- `stringData` is write-only. `kubectl get secret -o yaml` always shows `data` in base64, never `stringData`.
- A `kubectl apply` that changes `data` on an immutable ConfigMap fails. That is by design: create a new object.
- Mounted updates are eventually consistent. A change is not visible in the Pod when `kubectl apply` returns.
- `envFrom` has no allowlist. To audit a container's variables, read the referenced ConfigMap or Secret too.

## The task

Write three YAML documents in `stub.yaml`, separated by `---` lines.

Document 1 is an immutable ConfigMap:

1. Set `apiVersion: v1`, `kind: ConfigMap` and `metadata.name: app-config`.
2. Set the top-level `immutable` field to `true`.
3. Set `data` to `LOG_LEVEL: "info"` and `FEATURE_X: "enabled"`.

Document 2 is a Secret:

1. Set `apiVersion: v1`, `kind: Secret` and `metadata.name: app-secret`.
2. Set the top-level `type` field to `Opaque`.
3. Set `data.DB_PASSWORD` to `czNjcjN0`. That is the base64 encoding of `s3cr3t`.
4. Set `stringData.API_KEY` to `"plaintext-key-here"`.

Document 3 is a Pod that reads both, in all three ways:

1. Set `apiVersion: v1`, `kind: Pod` and `metadata.name: app`.
2. Add one container with `name: app` and `image: app:1.0`.
3. Add one `envFrom` entry with `configMapRef.name: app-config`.
4. Add one `env` entry named `DB_PASSWORD`.
5. Load it from `secretKeyRef` with `name: app-secret` and `key: DB_PASSWORD`.
6. Add one `volumeMounts` entry with `name: config-volume` and `mountPath: /etc/config`.
7. Add one `spec.volumes` entry with `name: config-volume` and `configMap.name: app-config`.

The file must match this content:

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
