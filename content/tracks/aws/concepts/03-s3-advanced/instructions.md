## What you build

You write `stub.sh`, a script that sets the bucket-level controls production systems depend on. You turn on versioning, add a lifecycle rule, a bucket policy, encryption at rest and static website hosting. This lesson builds on **S3 Basics**.

## Key concepts

### Versioning keeps every past version of an object

After you turn on versioning, a write to a key does not overwrite it:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-bucket-versioning \
  --bucket fluent-s3-advanced \
--versioning-configuration Status=Enabled
```

Each `PutObject` to the same key creates a **new version** with its own version ID. S3 overwrites nothing and loses nothing.

### `DeleteObject` on a versioned bucket adds a delete marker

On a versioned bucket, `DeleteObject` removes nothing. It inserts a *delete marker*: a new, zero-byte version. Normal `GetObject` and `ListObjects` calls then treat the object as gone. Every real version still exists underneath.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api delete-object \
  --bucket fluent-s3-advanced \
  --key report.csv
# The object looks deleted.
# Nothing was removed.

aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-object-versions \
  --bucket fluent-s3-advanced \
  --prefix report.csv
# Shows the original version
# and the new delete marker.
```

To remove the data and free the storage, delete the marker and every real version, each by its `--version-id`. To undelete an object, delete only the delete marker. The version below it becomes visible again.

### A lifecycle rule moves or expires objects by age

A lifecycle configuration moves objects to another storage class, or deletes them, by age. You do not write a cron job:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api \
  put-bucket-lifecycle-configuration \
  --bucket fluent-s3-advanced \
  --lifecycle-configuration '{
  "Rules": [{
    "ID": "archive-old-logs",
    "Status": "Enabled",
    "Filter": {"Prefix": "logs/"},
    "Transitions": [{
      "Days": 30,
      "StorageClass": "STANDARD_IA"
    }],
    "Expiration": {"Days": 365}
  }]
}'
```

Objects under `logs/` move to Standard-IA after 30 days. S3 deletes them after 365 days. Versioning alone never deletes anything. To clean up old versions, use `NoncurrentVersionTransitions` and `NoncurrentVersionExpiration` in a lifecycle rule.

### Use bucket policies, not ACLs

Two mechanisms control access to a bucket:

- An **ACL** (access control list) is a grant list per object or per bucket. It grants `READ`, `WRITE` or `FULL_CONTROL` to accounts or predefined groups like `AllUsers`. ACLs are older than IAM and are the oldest access control in AWS.
- A **bucket policy** is an IAM-style JSON document on the bucket. It has the same `Effect`, `Action`, `Resource` and `Condition` shape as IAM policies in the next concept. It applies to *any* principal, not only the users in your account.

AWS guidance and production checklists say the same: use bucket policies. ACLs cannot express conditions and cannot reference IAM roles cleanly. New buckets have ACLs off by default (`ObjectOwnership: BucketOwnerEnforced`). You find ACLs in old Terraform modules; do not write new ones.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-bucket-policy \
  --bucket fluent-s3-advanced \
  --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource":
"arn:aws:s3:::fluent-s3-advanced/public/*"
  }]
}'
```

### Server-side encryption encrypts objects at rest

S3 encrypts each object before it writes it to disk, and decrypts it on read. Callers see no difference.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-bucket-encryption \
  --bucket fluent-s3-advanced \
  --server-side-encryption-configuration \
'{"Rules": [{
  "ApplyServerSideEncryptionByDefault":
    {"SSEAlgorithm": "aws:kms"}
}]}'
```

`AES256` (SSE-S3) uses S3-managed keys. It needs no setup and is a good default. `aws:kms` (SSE-KMS) uses a customer-managed KMS key. Each decrypt is a logged KMS API call, so you get an audit trail. You can revoke access when you disable the key. The cost is one KMS API call per object access.

### S3 can serve a bucket as a static website

S3 can serve the contents of a bucket as a website with no origin server. Use it for static sites, or as an origin behind CloudFront:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-bucket-website \
  --bucket fluent-s3-advanced \
  --website-configuration '{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {"Key": "error.html"}
}'
```

Website hosting needs a public bucket policy that allows `s3:GetObject`. A prefix cannot be both served as a website and private.

### Versioning differs from Git and backups

Git records history per explicit commit. S3 versioning records a version on each write, automatically. You pay for every stored version until a lifecycle rule expires it.

## Watch out

- You try to turn off versioning. You cannot. You can only suspend it with `Status=Suspended`. Old versions stay, and new writes stop creating versions.
- You trust a successful `DeleteObject` on a versioned bucket. It does not prove that data is gone. For compliance or GDPR deletion, check `list-object-versions`.
- You assume a lifecycle rule that works on LocalStack works on AWS. LocalStack does not enforce the AWS transition limits. By default, objects smaller than 128 KB do not transition. One rule cannot move an object out of a class before that class's minimum storage duration.
- You scope a public website policy to the whole bucket. Scope `Resource` to one prefix, like `bucket/public/*`, unless every object must be public.

## The task

Fill in `stub.sh`. Work on the bucket `fluent-s3-advanced` and do these steps in order:

1. Create the bucket with `aws s3 mb s3://fluent-s3-advanced`. Write the name in full: the test checks this literal, not `$BUCKET`.
2. Turn on versioning with `Status=Enabled`.
3. Delete the object `report.csv` with `s3api delete-object`.
4. List all object versions under that prefix, to show the delete marker.
5. Add a comment line `# answer: <your answer>`. In one sentence, say why the delete call removed no data. Use the word "delete".
6. Add a lifecycle rule `archive-old-logs`. It moves objects under `logs/` to `STANDARD_IA` after 30 days. It expires them after 365 days.
7. Add a bucket policy that allows public `s3:GetObject` on everything under `public/*`.
8. Turn on default server-side encryption with `aws:kms`.
9. Turn on static website hosting with `index.html` as the index document and `error.html` as the error document.

Write the expiration as `"Days": 365` on one line. The commands look like the key concepts above. Steps 2 to 5 look like this:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-bucket-versioning \
  --bucket fluent-s3-advanced \
--versioning-configuration Status=Enabled
aws --endpoint-url "$ENDPOINT_URL" \
  s3api delete-object \
  --bucket fluent-s3-advanced \
  --key report.csv
aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-object-versions \
  --bucket fluent-s3-advanced \
  --prefix report.csv
# answer: delete-object only adds a
# delete marker; old versions remain.
```

To run it against LocalStack, create the bucket, turn on versioning and upload `report.csv` first. Then run `bash stub.sh`. The `list-object-versions` output shows the original version and the delete marker.
