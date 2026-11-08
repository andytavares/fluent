## What you build

You write `stub.sh`, a script that stores a database secret and an API key, scopes access to the secret and turns on rotation. This last concept ties the track together: where config and secrets belong in a production AWS system, and why. This lesson builds on **IAM Users & Policies**, **IAM Roles & STS** and **CloudWatch**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### Secrets Manager rotates, Parameter Store is cheap

Both services store key/value config, encrypt it at rest and control access with IAM. These differences decide the choice:

| | Secrets Manager | Parameter Store |
|---|---|---|
| Cost | Per secret per month, plus API calls | Standard tier free |
| Rotation | Built in | None |
| Cross-account | Resource policies | Limited |

- **Secrets Manager** has first-class rotation Lambda templates for RDS, Redshift and DocumentDB. Use it for database credentials, third-party API keys and anything that needs rotation.
- **Parameter Store** has an Advanced tier with a small per-parameter charge. For rotation, you build your own Lambda on an EventBridge schedule. Use it for app config, feature flags and values that do not rotate.

If a value must rotate, or it is a credential with native rotation support, use Secrets Manager. RDS is the main case. For everything else, Parameter Store is cheaper and simpler. That includes plain config, endpoints, and sensitive values that you rotate by hand. Do not use Secrets Manager for everything: the per-secret cost adds up fast across a large app.

```bash
aws secretsmanager create-secret \
  --name prod/orders-db/password \
  --secret-string '{"username":"app_user",
"password":"correct-horse-battery-staple"}'

aws secretsmanager get-secret-value \
  --secret-id prod/orders-db/password
```

### `SecureString` encrypts a parameter with KMS

```bash
aws ssm put-parameter \
  --name /fluent/orders/api-key \
  --value "sk_live_abc123" \
  --type SecureString

aws ssm get-parameter \
  --name /fluent/orders/api-key \
  --with-decryption
```

`--type SecureString` encrypts the value at rest with KMS. `--type String`, the default, stores plain text. Anyone with `ssm:GetParameter` on the path can read a `String` parameter. Always use `SecureString` for sensitive values.

Without `--with-decryption`, a read returns a `SecureString` value still encrypted. This lets you audit separately who can see that a value exists and who can read it. `ssm:GetParameter` alone does not give decrypt access when you scope the KMS key policy separately.

Parameter Store names form a hierarchy, such as `/fluent/orders/api-key` and `/fluent/orders/db-host`. `get-parameters-by-path` reads the whole config tree of a service in one call. Applications use it to load all their config at startup.

### Rotation replaces a secret with no downtime

Rotation replaces a secret value on a schedule. Storing the new value is easy. The hard part is to tell every consumer without breaking anything mid-rotation.

Secrets Manager rotates with a dedicated Lambda function. AWS gives templates for RDS, Redshift and DocumentDB. The function does three steps:

1. It creates a new credential and secret version. The old one stays valid.
2. It tests the new credential against the real service.
3. It marks the new version as current. After a safety window, it retires the old one.

```bash
FN=arn:aws:lambda:us-east-1:000000000000

aws secretsmanager rotate-secret \
  --secret-id prod/orders-db/password \
  --rotation-lambda-arn \
  "$FN:function:rotate-db-password" \
  --rotation-rules \
  AutomaticallyAfterDays=30
```

Rotation is safe because the old and new credentials exist together for a short time. A consumer that read the secret shortly before rotation does not fail. It uses the previous, still-valid version until it reads again.

### Scope secret access to one ARN

Never grant `secretsmanager:GetSecretValue` on all resources. Scope it to the secret ARNs that the role needs:

```json
{
  "Effect": "Allow",
  "Action":
    "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*"
}
```

The trailing `-*` matches the random suffix that Secrets Manager adds to every secret ARN. This is least privilege from **IAM Users & Policies**, on the resource where broad access does the most harm. A role that can read every secret turns any bug or compromise in its code into a breach of all secrets in the account.

### The 12-factor config checklist

Every concept in this track leads here. The config of a production-ready AWS application meets these rules:

1. **No secrets in code or version control, ever.** See **IAM Users & Policies** and this concept.
2. **No long-lived credentials where a role works.** Compute reaches AWS through an assumed role, not a static access key. See **IAM Roles & STS**.
3. **Config varies by environment, not by code path.** One artifact reads different parameter paths and secrets per stage. It does not branch on `if (env === "prod")`. See the environment variables in **Lambda Functions** and the hierarchical paths here.
4. **Secrets that can rotate, do rotate.** Rotation runs on a schedule, automatically, with no downtime. See this concept.
5. **Access to config and secrets is least privilege and auditable per resource.** No blanket account-wide grants. See **IAM Users & Policies** and this concept.
6. **Everything is observable.** Metrics, alarms and logs cover the failure modes that matter before the first incident. See **CloudWatch**.
7. **Failure handling expects redelivery and retries.** You design idempotency in from the start. See **SQS** and **Lambda Event Sources**.

### Kubernetes Secrets are not encrypted by default

A Kubernetes Secret is base64-encoded, not encrypted, unless you configure etcd encryption. Its name suggests encryption that is not there. Secrets Manager and `SecureString` encrypt by default. HashiCorp Vault encrypts too, and its dynamic secrets can generate short-lived database credentials on demand.

## Watch out

- `ssm get-parameter` without `--with-decryption` returns ciphertext for a `SecureString`, not an error.
- A script that forgets the flag does not fail. It gets garbage that looks like a value.
- The Secrets Manager per-secret charge grows fast with one secret per environment, credential and service.
- Store one database as one JSON secret with username, password and host, not five secrets.
- A failed rotation keeps the old credential valid. A broken rotation function can go unnoticed for months.
- Alarm on rotation failures with **CloudWatch**. Do not trust the schedule alone.
- A broad ARN pattern, such as `secret:prod/*`, brings back over-broad access. Scope to the one secret the consumer needs.

## The task

Write `stub.sh` to store the order service secrets and lock down access. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Create the Secrets Manager secret `prod/orders-db/password` with the secret string below.
2. Read the value with `get-secret-value --secret-id prod/orders-db/password`.
3. Put the SSM parameter `/fluent/orders/api-key` with value `sk_live_abc123` and `--type SecureString`.
4. Read the parameter with `--with-decryption`.
5. Write `secret-access-policy.json` with a heredoc. It allows `secretsmanager:GetSecretValue` on the secret ARN below.
6. The policy must not use `"Resource": "*"`.
7. Run `secretsmanager rotate-secret` on the secret with `--rotation-lambda-arn` and `--rotation-rules AutomaticallyAfterDays=30`.
8. Add a comment that starts with `# answer:`. Name the checklist item that a password committed to Git violates, and why.

Use these values:

- Secret string: `{"username":"app_user","password":"correct-horse-battery-staple"}`
- Secret ARN: `arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*`
- Rotation function: `arn:aws:lambda:us-east-1:000000000000:function:rotate-db-password`

The finished script makes these calls:

```bash
aws secretsmanager create-secret \
  --name prod/orders-db/password \
  --secret-string '{"username":"app_user",
"password":"correct-horse-battery-staple"}'

aws secretsmanager get-secret-value \
  --secret-id prod/orders-db/password

aws ssm put-parameter \
  --name /fluent/orders/api-key \
  --value "sk_live_abc123" \
  --type SecureString

aws ssm get-parameter \
  --name /fluent/orders/api-key \
  --with-decryption

cat > secret-access-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action":
    "secretsmanager:GetSecretValue",
    "Resource": "arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*"
  }]
}
EOF

FN=arn:aws:lambda:us-east-1:000000000000
aws secretsmanager rotate-secret \
  --secret-id prod/orders-db/password \
  --rotation-lambda-arn \
  "$FN:function:rotate-db-password" \
  --rotation-rules \
  AutomaticallyAfterDays=30

# answer: it breaks "no secrets in code or
# version control": Git keeps it forever.
```

### Run it for real

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
aws secretsmanager get-secret-value \
  --endpoint-url http://localhost:4566 \
  --secret-id prod/orders-db/password
```
