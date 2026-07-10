# CLI & LocalStack

## What you'll learn

This track teaches AWS the way you'll actually practice it here: every command runs against **LocalStack**, an open-source emulator that implements the real AWS APIs on your laptop, with zero cloud spend and zero risk of a surprise bill. You'll learn the `aws` CLI's plumbing — endpoints, credentials, profiles, output formats, and JMESPath queries — all of which carry over unchanged to real AWS.

## Key concepts

### What LocalStack actually is

LocalStack runs a set of Docker containers that speak the real AWS wire protocol (the same signed HTTP requests the `aws` CLI and every SDK send to `amazonaws.com`). Point any AWS client at LocalStack's endpoint instead of AWS's, and — for the services it supports — the client can't tell the difference. It isn't a mock library or a stub; it's an actual implementation of S3, DynamoDB, Lambda, SQS, IAM, and dozens of other services, running locally.

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
```

Every service (S3, DynamoDB, Lambda, ...) is reachable through a **single port, 4566** — LocalStack routes based on the request's signature, not the port.

### The `--endpoint-url` flag

Real AWS resolves the endpoint automatically from the service and region (e.g. `s3.us-east-1.amazonaws.com`). Against LocalStack you override that with `--endpoint-url`:

```bash
aws --endpoint-url http://localhost:4566 s3 ls
aws --endpoint-url http://localhost:4566 dynamodb list-tables
```

Every command in this track passes `--endpoint-url http://localhost:4566`. In production you'd simply omit the flag — the rest of the command is identical. This is the entire point of practicing against LocalStack: the muscle memory transfers 1:1.

### Credentials, without a real account

The CLI refuses to run without *some* credentials configured, but LocalStack doesn't validate them — any non-empty string works:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

Against real AWS these would be actual IAM credentials (never hardcode real ones in scripts — see the IAM and Secrets Manager concepts later in this track).

### Profiles

`aws configure --profile localstack` writes a named credential/region block to `~/.aws/credentials` and `~/.aws/config`. Any command can then target it with `--profile localstack` instead of relying on environment variables or the `default` profile:

```bash
aws configure --profile localstack
# AWS Access Key ID: test
# AWS Secret Access Key: test
# Default region name: us-east-1
# Default output format: json

aws --profile localstack --endpoint-url http://localhost:4566 sts get-caller-identity
```

Profiles matter the moment you juggle more than one account — production, staging, and a personal sandbox, say. Environment variables are simpler for single-purpose scripts (like this track's exercises); profiles are what you reach for interactively.

### Output formats and `--query`

The CLI supports three output formats:

| Format | Use case |
|---|---|
| `json` (default) | Scripting, piping to `jq` |
| `text` | Tab-separated, easy to `awk`/`cut` |
| `table` | Human-eyeballing in a terminal |

`--query` applies a [JMESPath](https://jmespath.org/) expression to the response **before** formatting — it's not a separate filtering step you bolt on after, it's built into every API call:

```bash
# Full response
aws --endpoint-url http://localhost:4566 s3api list-buckets

# Just the bucket names, as a flat list
aws --endpoint-url http://localhost:4566 s3api list-buckets \
  --query 'Buckets[].Name' --output text
```

`Buckets[].Name` reads as "for every element of the `Buckets` array, take its `Name` field." JMESPath supports filters too — `Buckets[?Name==\`my-bucket\`]` — but the projection syntax above (`[]` to flatten, `.Field` to project) covers most day-to-day scripting.

### `aws sts get-caller-identity` — the health check

Before doing anything else against a new endpoint, confirm you're talking to it:

```bash
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```

Against real AWS this returns your actual account ID, user/role ARN, and user ID — it's the fastest way to answer "which account/credentials am I actually using right now?" Against LocalStack it returns a fixed dummy identity, but the round-trip confirms the container is up and reachable.

## vs other tools

| | AWS CLI + LocalStack | AWS Console | Terraform against LocalStack |
|---|---|---|---|
| Feedback loop | Seconds, scriptable | Manual clicking, not reproducible | Plan/apply cycle, slower per-iteration |
| What it teaches | The exact API calls the SDKs make | High-level intent, hides the API shape | Declarative end-state, hides individual calls |
| Best for | Learning the service semantics, debugging, one-off ops | Exploration, visualizing what exists | Repeatable infrastructure provisioning |

This track deliberately uses the CLI, not Terraform or the Console: every `aws` command maps directly to one API action, which is the fastest way to build a mental model of what each service actually does under the hood. Once you know the API shape, Terraform's resource arguments (and every SDK's method signatures) stop feeling arbitrary — they're the same fields you just typed by hand.

## Watch out

- **A missing `--endpoint-url` against LocalStack fails differently than you'd expect** — the CLI doesn't error immediately; it tries to reach real AWS with your fake `test`/`test` credentials and returns an authentication failure. If you see `InvalidAccessKeyId` or a DNS-looking timeout, check you didn't forget the flag on that one command.
- **`--query` operates on the raw JSON structure, not the CLI's pretty-printed table.** Run a command once without `--query` to see the actual field names and nesting before you write the JMESPath expression.
- **Region still matters against LocalStack**, even though nothing physically lives in `us-east-1`. Resources are namespaced per region+account in LocalStack's internal state just like real AWS — create a bucket in one region and query it with a different `AWS_DEFAULT_REGION` and it won't be found.

## The task

Write a script, `stub.sh`, that sets up and verifies a LocalStack CLI environment. Fill in the TODOs so the script:

1. Exports three environment variables LocalStack accepts as dummy credentials: `AWS_ACCESS_KEY_ID=test`, `AWS_SECRET_ACCESS_KEY=test`, `AWS_DEFAULT_REGION=us-east-1`.
2. Defines a reusable variable `ENDPOINT_URL=http://localhost:4566`.
3. Runs a health check: `aws --endpoint-url "$ENDPOINT_URL" sts get-caller-identity`.
4. Creates a bucket named `fluent-cli-demo`: `aws --endpoint-url "$ENDPOINT_URL" s3 mb s3://fluent-cli-demo`.
5. Lists all buckets in human-readable table form: `aws --endpoint-url "$ENDPOINT_URL" s3api list-buckets --output table`.
6. Lists just the bucket names as flat text using a JMESPath query: `aws --endpoint-url "$ENDPOINT_URL" s3api list-buckets --query 'Buckets[].Name' --output text`.

### Run it for real

With Docker installed:

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
```

You should see a dummy caller identity, then `fluent-cli-demo` appear in both the table and the flat-text bucket list.
