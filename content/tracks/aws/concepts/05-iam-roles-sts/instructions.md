## What you build

You write `stub.sh`, a script that creates a Lambda execution role, gives it permissions and assumes it with STS. Roles let production systems get permissions with no long-lived credentials in a config file. This lesson builds on **IAM Users & Policies**.

## Key concepts

### A role has no credentials of its own

A user has permanent credentials: a password, or access keys that exist until you rotate or delete them. A **role** has no credentials. A person, a service or another AWS account *assumes* the role. STS (Security Token Service) then issues **temporary** credentials on demand, usually valid for 15 minutes to 12 hours.

This is the biggest production security gain over IAM users. A leaked temporary credential expires on its own. A leaked long-lived access key stays valid until someone notices and rotates it. Prefer roles for anything that runs inside AWS: EC2 instances, Lambda functions and ECS tasks. Users are for humans and external systems with no other source of credentials.

### A role has a trust policy and a permission policy

A role has *two* policies. Mixing them up is the most common mistake.

- The **trust policy** (`AssumeRolePolicyDocument`) says *who can assume the role*.
- The **permission policy** says *what the role can do* after someone assumes it. It is an ordinary identity policy, with the same JSON shape as the last concept.

```bash
cat > trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "lambda.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
EOF
```

This trust policy lets the Lambda service assume the role for a running function. Without it, Lambda gets no credentials for the role, whatever permission policy you attach. AWS checks the trust policy first, apart from what the role can *do*.

You attach a permission policy to a role with the same kind of call as for a user:

```bash
ACCOUNT=000000000000
aws --endpoint-url "$ENDPOINT_URL" \
  iam attach-role-policy \
  --role-name lambda-exec-role \
  --policy-arn \
  arn:aws:iam::$ACCOUNT:policy/s3-read-only
```

### `sts assume-role` returns three temporary values

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  sts assume-role \
  --role-session-name demo-session \
  --role-arn \
arn:aws:iam::$ACCOUNT:role/lambda-exec-role
```

The response has an `AccessKeyId`, a `SecretAccessKey` **and** a `SessionToken`. A user access key has no session token. Temporary credentials always have one, and every signed request must include it. Export the three values as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` to act as the role until they expire.

`--role-session-name` shows in CloudTrail logs and `sts:AssumeRole` audit trails. Name it after the caller, like `ci-pipeline-deploy` or `lambda-invoke-abc123`, not a generic placeholder.

### Compute services assume roles for you

In practice, you never call `assume-role` for compute services. AWS does it for you, all the time:

- An **EC2 instance profile** attaches a role to an instance. The EC2 metadata service (`169.254.169.254`) serves rotating temporary credentials. The AWS SDK on the instance picks them up.
- The Lambda service assumes the **Lambda execution role** before your function code runs. The SDK signs your function's calls with those temporary credentials.
- An **ECS task role** works the same way, per task instead of per EC2 host.

So idiomatic AWS code never hardcodes an access key. The default SDK credential chain checks environment variables, then the shared credentials file, then the instance or container metadata endpoint. In a correct deployment, only the last one has credentials.

Kubernetes service-account token projection and GCP workload identity federation solve the same problem with the same trust-then-short-token pattern.

### A permission boundary caps what a role can do

A permission boundary is a *second*, separate policy on a user or role. It sets the **maximum** permissions, whatever identity policies you attach later. It grants nothing by itself; it is a ceiling. With it, a team can create its own IAM roles, for example with Terraform. They cannot grant themselves admin by accident or on purpose, because the boundary caps every role they create.

## Watch out

- Your principal is missing from the trust policy. The `AssumeRole` call fails with `AccessDenied` before AWS checks permissions. Check the trust policy first.
- You call `sts assume-role` as a human or CLI caller with only a trust policy. You also need `sts:AssumeRole` on that role ARN in an identity policy. Service principals do not need it.
- A long job outlives its session. The temporary credentials expire mid-script with no warning. Refresh them, or use an instance or task role, which rotates them for you.
- You debug a role and mix up boundaries and trust policies. A boundary caps what a role can *do*. A trust policy controls who can *become* it.

## The task

Fill in `stub.sh` with these steps, in order:

1. Write a trust policy to the file `trust-policy.json` with a heredoc. It allows the `lambda.amazonaws.com` service principal to `sts:AssumeRole`.
2. Create the role `lambda-exec-role` from that file, with `--assume-role-policy-document file://trust-policy.json`.
3. Attach the AWS managed policy `arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess` to `lambda-exec-role`.
4. Assume the role with `sts assume-role`. Use the role ARN `arn:aws:iam::000000000000:role/lambda-exec-role`.
5. Use `--role-session-name demo-session`.
6. Add a comment `# answer: <one sentence>`. Say why a Lambda execution role has no long-lived access keys of its own.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  iam create-role \
  --role-name lambda-exec-role \
--assume-role-policy-document file://trust-policy.json

aws --endpoint-url "$ENDPOINT_URL" \
  iam attach-role-policy \
  --role-name lambda-exec-role \
  --policy-arn \
arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

ACCOUNT=000000000000
aws --endpoint-url "$ENDPOINT_URL" \
  sts assume-role \
  --role-session-name demo-session \
  --role-arn \
arn:aws:iam::$ACCOUNT:role/lambda-exec-role
```

To run it against LocalStack, run `bash stub.sh`. The `assume-role` output has `AccessKeyId`, `SecretAccessKey` and `SessionToken`. These are the three values you export to act as the role.
