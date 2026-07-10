# S3 Advanced

## What you'll learn

Beyond put/get, S3 has a set of bucket-level controls production systems depend on: versioning (and the delete-marker trap that surprises almost everyone the first time), lifecycle rules that automatically age data into cheaper storage, policy-based access control, encryption at rest, and static website hosting. This concept builds on `s3-basics`.

## Key concepts

### Versioning — and delete markers

Once enabled, versioning keeps every past version of an object instead of overwriting it:

```bash
aws --endpoint-url http://localhost:4566 s3api put-bucket-versioning \
  --bucket fluent-s3-advanced --versioning-configuration Status=Enabled
```

Every `PutObject` to the same key now creates a **new version** with its own version ID; nothing is overwritten or lost. Here's the part that trips people up: **`DeleteObject` on a versioned bucket does not delete anything.** It inserts a *delete marker* — a new, zero-byte "version" that makes the object appear gone from normal `GetObject`/`ListObjects` calls, while every real version still exists underneath.

```bash
aws --endpoint-url http://localhost:4566 s3api delete-object \
  --bucket fluent-s3-advanced --key report.csv
# object appears deleted, but nothing was actually removed

aws --endpoint-url http://localhost:4566 s3api list-object-versions \
  --bucket fluent-s3-advanced --prefix report.csv
# shows the original version AND the new delete marker
```

To *actually* remove data (and reclaim storage) from a versioned bucket, you must delete the delete marker itself and every real version, each by its specific `--version-id`. This is also exactly how you "undelete" something: delete the delete marker, and the underlying version becomes visible again.

### Lifecycle rules

A lifecycle configuration automatically transitions or expires objects based on age, without you writing a cron job:

```bash
aws --endpoint-url http://localhost:4566 s3api put-bucket-lifecycle-configuration \
  --bucket fluent-s3-advanced \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "archive-old-logs",
      "Status": "Enabled",
      "Filter": {"Prefix": "logs/"},
      "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"}],
      "Expiration": {"Days": 365}
    }]
  }'
```

This says: anything under `logs/` moves to Standard-IA after 30 days, and is deleted outright after 365. Lifecycle rules also support `NoncurrentVersionTransitions`/`NoncurrentVersionExpiration` — the mechanism for cleaning up old versions in a versioned bucket, since versioning alone never deletes anything on its own.

### Bucket policies vs ACLs

Two overlapping mechanisms control access, and one of them is legacy:

- **ACLs** (Access Control Lists) are a per-object or per-bucket grant list (`READ`, `WRITE`, `FULL_CONTROL` to specific accounts or predefined groups like `AllUsers`). They predate IAM and are AWS's oldest access-control mechanism.
- **Bucket policies** are IAM-style JSON documents attached to the bucket — the same `Effect`/`Action`/`Resource`/`Condition` shape you'll use for IAM policies in the next concept, but scoped to one bucket and evaluated against *any* principal, not just your own account's users.

AWS's own guidance (and every production checklist) says: **use bucket policies, not ACLs.** ACLs can't express conditions, can't reference IAM roles cleanly, and modern S3 buckets have ACLs disabled by default (`ObjectOwnership: BucketOwnerEnforced`). Treat ACLs as something you'll encounter in old Terraform modules, not something to write yourself.

```bash
aws --endpoint-url http://localhost:4566 s3api put-bucket-policy \
  --bucket fluent-s3-advanced \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fluent-s3-advanced/public/*"
    }]
  }'
```

### Encryption

Server-side encryption at rest — AWS encrypts objects before writing them to disk and decrypts on read, transparent to callers:

```bash
aws --endpoint-url http://localhost:4566 s3api put-bucket-encryption \
  --bucket fluent-s3-advanced \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}
    }]
  }'
```

`AES256` (S3-managed keys, "SSE-S3") requires zero setup and is the sane default. `aws:kms` ("SSE-KMS") uses a customer-managed KMS key, giving you audit trails (every decrypt is a logged KMS API call) and the ability to revoke access by disabling the key — at the cost of a KMS API call per object access.

### Static website hosting

S3 can serve a bucket's contents directly as a website (no origin server), useful for pure static sites or as a CDN origin behind CloudFront:

```bash
aws --endpoint-url http://localhost:4566 s3api put-bucket-website \
  --bucket fluent-s3-advanced \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "error.html"}
  }'
```

This makes the bucket serve HTTP requests directly — it requires a public bucket policy allowing `s3:GetObject` (website hosting and "keep it private" are mutually exclusive for a given prefix).

## vs other tools

| | S3 versioning | Git | Traditional backups |
|---|---|---|---|
| Granularity | Per-object, automatic on every write | Per-commit, explicit | Per-snapshot, scheduled |
| "Delete" semantics | Adds a marker; data stays until explicitly purged | `git rm` + commit; history still recoverable | Depends on retention policy |
| Storage cost | Every version billed until expired via lifecycle | Compressed deltas | Deduplicated, policy-driven |

## Watch out

- **Versioning cannot be disabled once enabled** — only suspended (`Status=Suspended`). Existing versions remain; new writes stop creating new versions.
- **A `DeleteObject` call "succeeding" on a versioned bucket tells you nothing about whether data was destroyed.** Always check `list-object-versions` if you need to confirm actual removal (e.g., for compliance/GDPR deletion requirements).
- **Lifecycle transitions have minimum object size/age constraints** on real AWS (e.g., you can't transition to `GLACIER` before 30 days per some class combinations) — LocalStack is permissive, so don't assume something that works here is guaranteed to be schedulable exactly the same way on real AWS without checking current transition rules.
- **A public bucket policy for website hosting is easy to accidentally make broader than intended** — scope `Resource` to the specific prefix (`arn:...:::bucket/public/*`), never the whole bucket, unless every object truly should be public.

## The task

Fill in `stub.sh` so it, in order, against a bucket named `fluent-s3-advanced`:

1. Creates the bucket.
2. Enables versioning (`Status=Enabled`).
3. Deletes the object `report.csv` and then lists all object versions under that prefix to show the delete marker — add a comment line `# answer: <your answer>` explaining in one sentence why the delete-object call didn't actually remove any data.
4. Applies a lifecycle configuration with a rule `archive-old-logs` that transitions objects under prefix `logs/` to `STANDARD_IA` after 30 days and expires them after 365 days.
5. Applies a bucket policy allowing public `s3:GetObject` on everything under `public/*`.
6. Enables default server-side encryption using `aws:kms`.
7. Configures static website hosting with `index.html` as the index document and `error.html` as the error document.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
echo "a,b,c" > report.csv
aws --endpoint-url http://localhost:4566 s3 mb s3://fluent-s3-advanced
aws --endpoint-url http://localhost:4566 s3api put-bucket-versioning \
  --bucket fluent-s3-advanced --versioning-configuration Status=Enabled
aws --endpoint-url http://localhost:4566 s3 cp report.csv s3://fluent-s3-advanced/report.csv
bash stub.sh   # once filled in
```

Inspect `list-object-versions` output — you'll see both the original version and the delete marker.
