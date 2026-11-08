## What you build

You write `stub.sh`, a script that creates an IAM user and gives it read-only access to one bucket. IAM is the authorization system of AWS: it checks every API call against a policy. LocalStack does not enforce IAM by default. This lesson builds on **S3 Advanced**.

## Key concepts

### A principal is who makes the request

A **principal** makes the API call. It is an IAM user, an IAM role (next concept), another AWS account, or `*` (anyone, also anonymous). The credentials of a principal sign every request. Every authorization decision starts with "who is this?"

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  iam create-user --user-name deploy-bot
```

A user is a long-lived identity with its own credentials: a password, access keys, or both. Use users for humans and for systems outside AWS that cannot assume a role. Everything else must prefer roles.

### Identity policies and resource policies attach in different places

- An **identity-based policy** attaches to a user, group or role. It says "this principal can do X."
- A **resource-based policy** attaches to the resource. S3 bucket policies from the last concept are the most common example. It says "X can access this resource."

In the same account, an identity policy or a resource policy is enough to grant access. Cross-account access usually needs both. The resource trusts the other account, and the caller has permission to act.

### A policy statement has Effect, Action, Resource and Condition

Every IAM policy is a JSON document with the same statement shape:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadOnlyOnOneBucket",
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::fluent-data",
      "arn:aws:s3:::fluent-data/*"
    ],
    "Condition": {
      "StringEquals": {
        "aws:RequestedRegion": "us-east-1"
      }
    }
  }]
}
```

| Field | Meaning |
|---|---|
| `Effect` | `Allow` or `Deny`, nothing else |
| `Action` | API operations as `service:Operation` |
| `Resource` | The ARNs it applies to; wildcards allowed |
| `Condition` | Optional limits: IP range, MFA, time, tags |

`Action` examples are `s3:GetObject` and `dynamodb:PutItem`. `*` means every action, and it is almost never correct.

`Version: "2012-10-17"` is not a date to change. It is a fixed string that names the policy grammar version. Every modern policy uses this value.

### An ARN names one AWS resource

An Amazon Resource Name (ARN) is the universal identifier for one resource. You find ARNs in `Resource` fields, cross-references and API responses:

- `arn:aws:s3:::fluent-data/report.csv`
- `arn:aws:dynamodb:us-east-1:000000000000:table/Orders`
- `arn:aws:iam::000000000000:role/lambda-exec-role`

The format is `arn:partition:service:region:account-id:resource`:

- **partition**: `aws`, `aws-cn` or `aws-us-gov`.
- **service**: for example `s3` or `iam`.
- **region**: empty for global services like IAM and S3.
- **account ID**: empty for S3, because bucket names are globally unique.
- **resource**: the type and ID, specific to the service.

You write ARNs by hand all the time, so learn to read them.

### Least privilege grants only what the workload needs

Grant the minimum actions on the minimum resources. `"Action": "s3:*"` on `"Resource": "*"` works the way an unlocked front door works: the failure comes later. Scope each policy to the actions and ARNs the workload needs. Add more only when you see a real need. CloudTrail logs of `AccessDenied` errors show what is missing.

### Explicit deny always wins

AWS evaluates all applicable policies together: identity, resource, permission boundaries and SCPs. It uses this order:

1. An explicit `Deny` anywhere denies the request, whatever any `Allow` says.
2. Otherwise, one explicit `Allow` allows the request.
3. Otherwise, the request gets an **implicit deny**. IAM denies by default.

So a new `Allow` does not fix access when a broader `Deny` applies. Examples are an organization SCP that blocks a region, or a permission boundary. Find the `Deny` and narrow it. Kubernetes RBAC has no native deny, so in IAM use a `Deny` statement to block one specific thing.

## Watch out

- You put `Resource: "*"` on a sensitive action. It is the most common security review finding. Ask if the action needs every resource of that type.
- You count attached policies to predict access. One explicit `Deny` in any policy or boundary still denies the request.
- You use a new user or policy at once on real AWS. IAM is eventually consistent, so you can get a short `AccessDenied`. LocalStack is usually instant.
- You lose the output of `aws iam create-access-key`. It is the only time AWS shows the secret key. You can only create a new key pair.

## The task

Fill in `stub.sh` with these steps, in order:

1. Create an IAM user named `deploy-bot`.
2. Write a policy document to `s3-read-policy.json` with a heredoc. Use `"Version": "2012-10-17"`.
3. The policy has `"Effect": "Allow"` on `s3:GetObject` and `s3:ListBucket`.
4. It covers `arn:aws:s3:::fluent-data` and `arn:aws:s3:::fluent-data/*`.
5. Create a customer-managed policy named `s3-read-only` from that file, with `--policy-document file://s3-read-policy.json`.
6. Attach that policy to `deploy-bot` by its ARN. LocalStack uses the fake account ID `000000000000`.
7. Create an access key for `deploy-bot`.
8. Add a comment `# answer: <one sentence>`. Say why least privilege needs specific actions and resources, not `s3:*` and `*`.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  iam create-user --user-name deploy-bot

cat > s3-read-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::fluent-data",
      "arn:aws:s3:::fluent-data/*"
    ]
  }]
}
EOF

aws --endpoint-url "$ENDPOINT_URL" \
  iam create-policy \
  --policy-name s3-read-only \
--policy-document file://s3-read-policy.json

ACCOUNT=000000000000
aws --endpoint-url "$ENDPOINT_URL" \
  iam attach-user-policy \
  --user-name deploy-bot \
  --policy-arn \
"arn:aws:iam::$ACCOUNT:policy/s3-read-only"

aws --endpoint-url "$ENDPOINT_URL" \
  iam create-access-key \
  --user-name deploy-bot
```

To check it against LocalStack, run `bash stub.sh`. Then run `iam list-attached-user-policies --user-name deploy-bot`. You see `s3-read-only`.
