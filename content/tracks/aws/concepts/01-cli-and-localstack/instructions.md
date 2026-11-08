## What you build

You write `stub.sh`, a script that sets up the `aws` CLI for LocalStack and checks that it works. Every command in this track runs against LocalStack, so you spend no money and risk no surprise bill. The CLI skills carry over unchanged to real AWS.

## Key concepts

### LocalStack runs real AWS APIs on your machine

LocalStack is an open-source emulator. It speaks the real AWS wire protocol: the same signed HTTP requests that the `aws` CLI and every SDK send to `amazonaws.com`. It is not a mock library. It implements S3, DynamoDB, Lambda, SQS, IAM and dozens of other services.

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
```

Every service is on **one port, 4566**. LocalStack routes each request by its signature, not by the port.

### `--endpoint-url` points the CLI at LocalStack

Real AWS finds the endpoint from the service and region, for example `s3.us-east-1.amazonaws.com`. For LocalStack, you override it with `--endpoint-url`:

```bash
ENDPOINT_URL=http://localhost:4566
aws --endpoint-url "$ENDPOINT_URL" s3 ls
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb list-tables
```

Every command in this track passes this flag. In production, you remove the flag and the rest of the command stays the same.

### Any non-empty credentials work

The CLI does not run without credentials. LocalStack does not check them, so any non-empty string works:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

On real AWS, these are real IAM credentials. Never hardcode real credentials in a script. The IAM and Secrets Manager concepts later in this track show the safe ways.

### A profile stores a named set of credentials

`aws configure --profile localstack` writes a named block to `~/.aws/credentials` and `~/.aws/config`. Any command can then use `--profile localstack`, instead of environment variables or the `default` profile:

```bash
aws configure --profile localstack
# AWS Access Key ID: test
# AWS Secret Access Key: test
# Default region name: us-east-1
# Default output format: json

aws --profile localstack \
  --endpoint-url "$ENDPOINT_URL" \
  sts get-caller-identity
```

Profiles help when you work with more than one account, for example production, staging and a personal sandbox. Environment variables are simpler for single-purpose scripts, like the scripts in this track. Use profiles when you work interactively.

### `--output` sets the format of the response

The CLI has three output formats:

| Format | Use |
|---|---|
| `json` (default) | Scripts, `jq` |
| `text` | Tab-separated, for `awk` or `cut` |
| `table` | Reading in a terminal |

### `--query` filters the response before the CLI formats it

`--query` applies a [JMESPath](https://jmespath.org/) expression to the response. The CLI applies it before it formats the output. It is part of every command, not a separate step after the call.

```bash
# Full response
aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-buckets

# Only the bucket names, as a flat list
aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-buckets \
  --query 'Buckets[].Name' --output text
```

`Buckets[].Name` means "for each element of the `Buckets` array, take its `Name` field." `[]` flattens and `.Field` projects. JMESPath also has filters, for example ``Buckets[?Name==`my-bucket`]``. Projections cover most daily scripts.

### `sts get-caller-identity` is the health check

Before you do anything against a new endpoint, confirm that you can reach it:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  sts get-caller-identity
```

On real AWS, it returns your account ID, user or role ARN, and user ID. It is the fastest way to see which account and credentials you use now. On LocalStack, it returns a fixed dummy identity. The round trip confirms that the container runs and answers.

### Each CLI command maps to one API action

This track uses the CLI, not Terraform or the Console. Each `aws` command maps to one API action, so you learn what each service does. The Console hides the API shape, and Terraform hides the individual calls. After you know the API, Terraform arguments and SDK method signatures use the same fields that you typed by hand.

## Watch out

- You forget `--endpoint-url` on one command. The CLI then calls real AWS with your fake `test` credentials. You get `InvalidAccessKeyId` or a timeout that looks like a DNS error.
- You write `--query` against the table output. `--query` works on the raw JSON structure. Run the command once without `--query` to see the real field names and nesting.
- You change `AWS_DEFAULT_REGION` and cannot find your bucket. LocalStack keeps resources per region and account, like real AWS.

## The task

Write `stub.sh`, a script that sets up and checks a LocalStack CLI environment. Fill in the TODOs so that the script does these steps:

1. Export the dummy credentials `AWS_ACCESS_KEY_ID=test` and `AWS_SECRET_ACCESS_KEY=test`.
2. Export `AWS_DEFAULT_REGION=us-east-1`.
3. Define the variable `ENDPOINT_URL=http://localhost:4566`.
4. Run the health check `sts get-caller-identity`.
5. Create the bucket `fluent-cli-demo` with `s3 mb`.
6. List all buckets with `s3api list-buckets --output table`.
7. List only the bucket names as flat text, with a JMESPath query and `--output text`.

Every `aws` command uses `--endpoint-url "$ENDPOINT_URL"`.

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" \
  sts get-caller-identity
aws --endpoint-url "$ENDPOINT_URL" \
  s3 mb s3://fluent-cli-demo
aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-buckets --output table
aws --endpoint-url "$ENDPOINT_URL" \
  s3api list-buckets \
  --query 'Buckets[].Name' --output text
```

To run it against a real LocalStack, start the container, then run `bash stub.sh`. You see a dummy caller identity. Then `fluent-cli-demo` shows in the table and in the flat list.
