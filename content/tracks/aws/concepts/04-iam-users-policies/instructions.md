# IAM Users & Policies

## What you'll learn

IAM (Identity and Access Management) is AWS's authorization system — every single API call you've made so far in this track was implicitly checked against an IAM policy (LocalStack just doesn't enforce it by default). This concept teaches the policy JSON grammar, ARNs, and the evaluation logic AWS uses to decide allow/deny — the foundation every other AWS security concept builds on.

## Key concepts

### Principals: who is asking

A **principal** is whoever/whatever is making the API call: an IAM user, an IAM role (next concept), another AWS account, or `*` (anyone, including anonymous). Every request to AWS is signed by some principal's credentials, and every authorization decision starts with "who is this."

```bash
aws --endpoint-url http://localhost:4566 iam create-user --user-name deploy-bot
```

A user is a long-lived identity with its own credentials (password and/or access keys). Users are appropriate for humans and for systems outside AWS that can't assume a role — everything else should prefer roles (next concept).

### Identity policies vs resource policies

There are two places a permission can be attached:

- **Identity-based policy**: attached to a user, group, or role. "This principal can do X."
- **Resource-based policy**: attached to the resource itself (S3 bucket policies, from the last concept, are the most common example). "This resource can be accessed by X."

A request is only allowed if **at least one attached policy explicitly allows it, and no policy explicitly denies it** — see evaluation order below. For same-account access, either an identity policy or a resource policy granting access is sufficient; cross-account access typically needs both (the resource must trust the other account, and the calling principal must be permitted to act).

### Policy JSON anatomy

Every IAM policy is a JSON document with the same four-field statement shape:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyOnOneBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::fluent-data",
        "arn:aws:s3:::fluent-data/*"
      ],
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": "us-east-1" }
      }
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `Effect` | `Allow` or `Deny` — nothing else |
| `Action` | The API operation(s), as `service:Operation` (`s3:GetObject`, `dynamodb:PutItem`, `*` for everything — almost never appropriate) |
| `Resource` | Which ARN(s) this applies to — supports wildcards (`arn:aws:s3:::fluent-data/*`) |
| `Condition` | Optional extra constraints — IP range, MFA presence, time of day, tag values, etc. |

`Version: "2012-10-17"` is not a typo or a date you should ever change — it's a fixed string identifying the policy grammar version; every modern policy uses this exact value.

### ARN structure

Amazon Resource Names are the universal identifier for "this specific thing," used in `Resource` fields, cross-references, and API responses alike:

```
arn:aws:s3:::fluent-data/report.csv
arn:aws:dynamodb:us-east-1:000000000000:table/Orders
arn:aws:iam::000000000000:role/lambda-exec-role
 │   │   │        │              │
 │   │   │        │              └─ resource type/id (service-specific)
 │   │   │        └─ account ID (empty for S3 — bucket names are globally unique)
 │   │   └─ region (empty for global services like IAM, S3)
 │   └─ service
 └─ partition (aws, aws-cn, aws-us-gov)
```

`arn:partition:service:region:account-id:resource`. Some services omit region and/or account (S3, IAM) because those services are either global or the bucket name is itself globally unique. Get comfortable reading these — you'll write them by hand constantly.

### Least privilege

The operating principle: grant the minimum `Action`s on the minimum `Resource`s needed, nothing more. `"Action": "s3:*"` on `"Resource": "*"` "works" the same way leaving your front door unlocked "works" — the failure mode is just further away in time. Scope every policy to the specific actions and specific ARNs the workload actually needs; expand only when a real, observed need appears (CloudTrail logs of `AccessDenied` errors are the standard way to find out what's missing).

### Policy evaluation: explicit deny always wins

AWS evaluates all applicable policies (identity + resource + any permission boundaries/SCPs) as a set, using this order:

1. **Explicit `Deny` anywhere → request denied**, full stop, regardless of any `Allow` elsewhere.
2. Otherwise, **at least one explicit `Allow` → request allowed**.
3. Otherwise (no matching statement at all) → **implicit deny** (the default — IAM is deny-by-default).

This is why "just add an Allow" doesn't fix an access problem if a broader Deny (e.g., an org-wide SCP blocking a region, or a permission boundary) is also in play — you have to find and narrow the Deny, not just add another Allow next to it.

## vs other tools

| | AWS IAM | Kubernetes RBAC | Unix file permissions |
|---|---|---|---|
| Grammar | JSON statements, Effect/Action/Resource/Condition | Verbs + resources + API groups | rwx bits per owner/group/other |
| Explicit deny | First-class, always wins | No native "deny" (only additive Roles/RoleBindings) | No deny concept — absence of a grant is denial |
| Scope | Account-wide, cross-service | Namespace/cluster-scoped, Kubernetes API only | Single filesystem |
| Attachment points | Identity AND resource | Identity (subjects) only | File/directory only |

The explicit-deny-wins rule is IAM's sharpest edge relative to Kubernetes RBAC, which has no native deny — if you're coming from k8s, expect to reach for IAM's `Deny` statements as your first tool for "block this specific thing" rather than trying to express it as an absence of grants.

## Watch out

- **`Resource: "*"` on a sensitive `Action` is the single most common security review finding.** Always ask "does this really need to touch every resource of this type in the account," not just "does this action exist."
- **Policies attached ≠ policies that matter.** A user can have five managed policies attached and still be denied, if any one statement anywhere (including in a policy boundary you forgot about) has an explicit `Deny` matching the request.
- **IAM is eventually consistent.** A newly created user or a newly attached policy can take a few seconds to be usable everywhere — don't be surprised by a transient `AccessDenied` immediately after a `create-user`/`attach-user-policy` call on real AWS (LocalStack is typically instant).
- **`aws iam create-access-key` is the only time the secret access key is ever shown** — it cannot be retrieved again later, only regenerated as a brand-new key pair.

## The task

Fill in `stub.sh` so it, in order:

1. Creates an IAM user named `deploy-bot`.
2. Writes a policy document to `s3-read-policy.json` (via a heredoc) granting `Effect: Allow` on `s3:GetObject` and `s3:ListBucket` for `arn:aws:s3:::fluent-data` and `arn:aws:s3:::fluent-data/*`, with `Version: "2012-10-17"`.
3. Creates a customer-managed policy named `s3-read-only` from that file (`--policy-document file://s3-read-policy.json`).
4. Attaches that policy to `deploy-bot` by its ARN (`arn:aws:iam::000000000000:policy/s3-read-only` — LocalStack's default fake account ID is `000000000000`).
5. Creates an access key for `deploy-bot`.
6. Adds a comment `# answer: <one sentence>` explaining why least privilege means this policy should list specific actions/resources rather than `"Action": "s3:*"` / `"Resource": "*"`.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
aws --endpoint-url http://localhost:4566 iam list-attached-user-policies --user-name deploy-bot
```

You should see `s3-read-only` attached to `deploy-bot`.
