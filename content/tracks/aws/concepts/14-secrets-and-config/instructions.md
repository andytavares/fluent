# Secrets & Config

## What you'll learn

This closing concept ties the whole track together: where configuration and secrets actually belong in a production AWS system, and why. You'll compare Secrets Manager and SSM Parameter Store (they overlap, and choosing wrong is a common and avoidable cost/complexity mistake), use `SecureString` parameters, understand rotation conceptually, scope IAM access down to individual secrets, and finish with the 12-factor config checklist that every concept in this track has been building toward.

## Key concepts

### Secrets Manager vs SSM Parameter Store — when each

Both store key/value configuration, encrypted at rest, IAM-gated. The differences that actually matter for choosing:

| | Secrets Manager | SSM Parameter Store |
|---|---|---|
| Cost | Per-secret monthly charge + API call charges | Standard tier is free; Advanced tier has a small per-parameter charge |
| Automatic rotation | Built-in, native (RDS, Redshift, DocumentDB have first-class rotation Lambda templates) | No native rotation — you'd build it yourself via an EventBridge-scheduled Lambda |
| Cross-account sharing | Native resource policies | More limited |
| Typical use | Database credentials, API keys to third parties, anything needing rotation | Application config, feature flags, non-rotating values, anything where the free tier's lack of rotation is fine |

Rule of thumb: **if it needs to rotate, or it's a credential to something with native rotation support (RDS especially), use Secrets Manager.** For everything else — plain config values, endpoints, non-sensitive settings, or sensitive-but-static values you're fine rotating manually — Parameter Store is cheaper and simpler. Don't default to Secrets Manager for everything; the per-secret cost adds up fast across a large app's full configuration surface.

```bash
aws --endpoint-url http://localhost:4566 secretsmanager create-secret \
  --name prod/orders-db/password \
  --secret-string '{"username":"app_user","password":"correct-horse-battery-staple"}'

aws --endpoint-url http://localhost:4566 secretsmanager get-secret-value \
  --secret-id prod/orders-db/password
```

### SSM Parameter Store and `SecureString`

```bash
aws --endpoint-url http://localhost:4566 ssm put-parameter \
  --name /fluent/orders/api-key \
  --value "sk_live_abc123" \
  --type SecureString

aws --endpoint-url http://localhost:4566 ssm get-parameter \
  --name /fluent/orders/api-key \
  --with-decryption
```

`--type SecureString` encrypts the value at rest with KMS; `--type String` (the default) stores it in plaintext. **Always use `SecureString` for anything sensitive** — plain `String` parameters are readable by anyone with `ssm:GetParameter` on that path, with no additional protection. `--with-decryption` is required to get the plaintext value back on read; without it, `SecureString` values are returned still encrypted (useful for auditing "who can see this exists" separately from "who can see the actual value," since `ssm:GetParameter` alone doesn't imply decrypt access if you scope KMS key policy separately).

Parameter Store's hierarchical naming (`/fluent/orders/api-key`, `/fluent/orders/db-host`) also supports `get-parameters-by-path` — reading an entire config tree for a service in one call, which is the standard way applications load "all my config" at startup.

### Rotation (concept)

Rotation means periodically replacing a secret's value **without downtime** — the hard part isn't storing the new value, it's coordinating "the secret changed" with every consumer so nothing breaks mid-rotation. Secrets Manager's native rotation works via a dedicated Lambda function (AWS provides templates for RDS/Redshift/DocumentDB) that:

1. Creates a *new* credential/secret version (without invalidating the old one yet).
2. Tests that the new credential actually works against the real service.
3. Only then marks the new version as current and (after a safety window) retires the old one.

```bash
aws --endpoint-url http://localhost:4566 secretsmanager rotate-secret \
  --secret-id prod/orders-db/password \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:000000000000:function:rotate-db-password \
  --rotation-rules AutomaticallyAfterDays=30
```

The key insight: rotation is safe specifically *because* the old and new credentials briefly coexist — a consumer that read the secret slightly before rotation completed doesn't suddenly fail; it just uses the previous (still-valid) version until it re-reads.

### IAM-scoped access to secrets

Never grant `secretsmanager:GetSecretValue` on `Resource: "*"` — scope it to the specific secret ARN(s) a given role actually needs:

```json
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*"
}
```

(The trailing `-*` accounts for the random suffix Secrets Manager appends to every secret's ARN.) This is the same least-privilege principle from `iam-users-policies`, applied to the one resource type where over-broad access is most directly catastrophic — a role that can read *every* secret in the account turns any bug in that role's code (or any compromise of it) into a full-account secrets breach.

### The 12-factor config checklist

Pulling every concept in this track together, a production-ready AWS application's configuration should satisfy:

1. **No secrets in code or version control** — ever. (`iam-users-policies`, this concept)
2. **No long-lived credentials where a role will do** — compute reaches AWS via an assumed role, not a static access key (`iam-roles-sts`).
3. **Config varies by environment, not by code path** — the same deployable artifact reads different Parameter Store paths/Secrets Manager secrets per stage, rather than branching on `if (env === "prod")` (`lambda-functions`' environment variables, this concept's hierarchical paths).
4. **Secrets that can rotate, do rotate** — on a schedule, automatically, with zero-downtime coordination (this concept).
5. **Access to config/secrets is least-privilege and auditable per resource**, not blanket account-wide grants (`iam-users-policies`, this concept).
6. **Everything is observable** — metrics/alarms/logs exist for the failure modes that matter, not bolted on after the first incident (`cloudwatch`).
7. **Failure handling assumes redelivery/retries will happen** — idempotency is designed in from the start, not patched in after a duplicate-processing incident (`sqs`, `lambda-event-sources`).

## vs other tools

| | AWS Secrets Manager / Parameter Store | HashiCorp Vault | Kubernetes Secrets |
|---|---|---|---|
| Encryption at rest | Yes (KMS) | Yes (Vault's own encryption barrier) | Base64-encoded by default, not encrypted unless etcd encryption is configured |
| Native rotation | Secrets Manager: yes, built-in | Yes, via dynamic secrets (even richer — can generate short-lived DB creds on demand) | No |
| Access control | IAM policies | Vault policies + auth methods | Kubernetes RBAC |

Kubernetes' default Secret object is the one most likely to surprise engineers moving between platforms — "Secret" in the name implies encryption at rest that isn't actually there without additional cluster configuration, unlike Secrets Manager/Parameter Store's `SecureString`, which is encrypted by default.

## Watch out

- **`ssm get-parameter` without `--with-decryption` silently returns the encrypted ciphertext for a `SecureString`**, not an error — a script that forgets the flag doesn't fail loudly, it just gets garbage that looks like a value.
- **Secrets Manager's per-secret monthly charge multiplies fast** if you create one secret per environment per credential per service without consolidating — a single JSON secret value (`{"username": ..., "password": ..., "host": ...}`) is usually better than five separate secrets for one database.
- **Rotation Lambda failures fail *safe* by design** (the old credential stays valid) but a broken rotation function left unnoticed for months means the "automatic" rotation you thought was happening, wasn't — alarm on rotation failures specifically (via the `cloudwatch` concept), don't just trust the schedule silently.
- **A resource ARN pattern that's too broad in an IAM policy** (`secret:prod/*` instead of `secret:prod/orders-db/password-*`) reintroduces the exact over-broad-access problem this concept exists to prevent — scope to the specific secret whenever the consumer only needs one.

## The task

Fill in `stub.sh` so it, in order:

1. Creates a Secrets Manager secret named `prod/orders-db/password` with secret string `{"username":"app_user","password":"correct-horse-battery-staple"}`.
2. Retrieves that secret's value.
3. Puts an SSM parameter named `/fluent/orders/api-key` with value `sk_live_abc123` and `--type SecureString`.
4. Retrieves that parameter with `--with-decryption`.
5. Writes an IAM policy JSON (heredoc, `secret-access-policy.json`) granting `Effect: Allow` on `secretsmanager:GetSecretValue` scoped to `arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*` (not `Resource: "*"`).
6. Configures rotation on the secret via `secretsmanager rotate-secret`, with `--rotation-lambda-arn arn:aws:lambda:us-east-1:000000000000:function:rotate-db-password` and `--rotation-rules AutomaticallyAfterDays=30`.
7. Adds a comment `# answer: <one sentence>` naming which 12-factor config checklist item (from the lesson) a hardcoded database password committed to a Git repo would violate, and why.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
aws --endpoint-url http://localhost:4566 secretsmanager get-secret-value --secret-id prod/orders-db/password
```
