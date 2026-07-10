# IAM Roles & STS

## What you'll learn

Roles are how production AWS systems get permissions **without** long-lived credentials sitting in a config file somewhere. This concept builds on `iam-users-policies` and covers trust policies, the STS `AssumeRole` flow that issues temporary credentials, the instance/service-role pattern every compute service uses, and permission boundaries.

## Key concepts

### Roles vs users — no long-lived credentials

A user has permanent credentials (a password, or access keys that exist until you rotate/delete them). A **role** has no credentials of its own at all — instead, something (a person, a service, another AWS account) *assumes* the role and receives **temporary** credentials, typically valid for 15 minutes to 12 hours, generated on demand by STS (Security Token Service).

This is the single biggest production security upgrade over IAM users: a compromised temporary credential expires on its own; a compromised long-lived access key is valid until someone notices and rotates it. The universal guidance is **prefer roles over users for anything that runs inside AWS** (EC2 instances, Lambda functions, ECS tasks) — users are really only for humans and external systems that have nowhere else to get credentials from.

### Trust policy vs permission policy

A role has *two* policies attached, and conflating them is the most common mistake:

- **Trust policy** (`AssumeRolePolicyDocument`): *who is allowed to assume this role.* Answers "who can become this role."
- **Permission policy**: *what the role can do once assumed* — an ordinary identity policy, same JSON shape as the last concept.

```bash
aws --endpoint-url http://localhost:4566 iam create-role \
  --role-name lambda-exec-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'
```

This trust policy says: the Lambda service itself is allowed to assume this role on behalf of a running function. Without it, Lambda cannot obtain credentials to act as this role no matter what permission policy is attached — the trust policy is checked first, independently of what the role can *do*.

Attaching the permission policy is the same call as for a user, just against a role:

```bash
aws --endpoint-url http://localhost:4566 iam attach-role-policy \
  --role-name lambda-exec-role \
  --policy-arn arn:aws:iam::000000000000:policy/s3-read-only
```

### The STS `AssumeRole` flow

```bash
aws --endpoint-url http://localhost:4566 sts assume-role \
  --role-arn arn:aws:iam::000000000000:role/lambda-exec-role \
  --role-session-name demo-session
```

The response contains an `AccessKeyId`, `SecretAccessKey`, **and** a `SessionToken` (unlike a user's access key, temporary credentials always include this third token — every signed request made with them must include it). These three values are exported as `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_SESSION_TOKEN` to act as the role until they expire.

`--role-session-name` isn't cosmetic — it shows up in CloudTrail logs and in `sts:AssumeRole` audit trails, so name it after what's doing the assuming (`ci-pipeline-deploy`, `lambda-invoke-abc123`), not a generic placeholder.

### Instance and service roles — the pattern behind "no credentials in code"

You never manually call `assume-role` for compute services in practice — AWS does it for you continuously:

- An **EC2 instance profile** attaches a role to an instance; the EC2 metadata service (`169.254.169.254`) serves rotating temporary credentials that the AWS SDK on that instance picks up automatically.
- A **Lambda execution role** is assumed by the Lambda service before your function code runs; your function's SDK calls are automatically signed with those temporary credentials.
- An **ECS task role** works the same way, scoped per task rather than per EC2 host.

This is why idiomatic AWS application code never hardcodes an access key: the SDK's default credential chain checks (in order) environment variables, the shared credentials file, then the instance/container metadata endpoint — and in a properly configured deployment, only the last one ever has anything to find.

### Permission boundaries (overview)

A permission boundary is a *second*, separate policy attached to a user or role that sets the **maximum** permissions it can ever have, regardless of what identity policies are later attached to it. It doesn't grant anything by itself — it's a ceiling. This is the standard mechanism for letting a team self-service-create IAM roles (e.g., via Terraform) without being able to accidentally (or maliciously) grant themselves admin: every role they create is capped by the boundary no matter what permission policy they attach.

## vs other tools

| | AWS STS roles | Kubernetes ServiceAccount + workload identity | Static long-lived secrets |
|---|---|---|---|
| Credential lifetime | Minutes to hours, auto-rotated | Short-lived tokens, projected and refreshed by the kubelet | Until manually rotated |
| Where credentials live | Never on disk — issued in memory via metadata service | Mounted token file, refreshed | Config file, env var, secrets manager |
| Cross-account access | `AssumeRole` across account boundaries with a trust policy | Cloud-provider-specific federation | Requires sharing the actual secret |

GCP's workload identity federation and Kubernetes' service-account token projection solve the same underlying problem (no static secrets for workloads) using a similar trust-then-issue-short-lived-token pattern — if you've configured either of those, `AssumeRole`'s trust policy will feel familiar.

## Watch out

- **A role with a perfect permission policy but no trust policy entry for your principal is completely unusable to you** — you'll get `AccessDenied` on the `AssumeRole` call itself, before permissions are even evaluated. Always check the trust policy first when "I can't assume this role" comes up.
- **`sts assume-role` requires the calling principal to *itself* have `sts:AssumeRole` permission on that specific role ARN** (via an identity policy) — the trust policy alone isn't sufficient for a human/CLI caller, only for AWS services assuming on your behalf via a service principal.
- **Temporary credentials expire silently mid-script** if a long-running job outlives the session duration — design long jobs to refresh credentials (or use an instance/task role, which auto-rotates transparently) rather than a one-time `assume-role` call.
- **Permission boundaries and trust policies are unrelated mechanisms** — a boundary caps what a role can *do*; a trust policy controls who can *become* it. Don't conflate them when debugging "this role isn't working as expected."

## The task

Fill in `stub.sh` so it, in order:

1. Creates a role named `lambda-exec-role` with a trust policy (via a heredoc file `trust-policy.json`) that allows the `lambda.amazonaws.com` service principal to `sts:AssumeRole`.
2. Attaches the AWS managed policy ARN `arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess` to `lambda-exec-role` as its permission policy.
3. Assumes the role via `sts assume-role`, using `--role-arn arn:aws:iam::000000000000:role/lambda-exec-role` and `--role-session-name demo-session`.
4. Adds a comment `# answer: <one sentence>` explaining why a Lambda execution role has no long-lived access keys of its own.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
```

The `assume-role` call's JSON output includes `AccessKeyId`, `SecretAccessKey`, and `SessionToken` — the three values you'd export to act as the role.
