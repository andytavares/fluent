## What you build

You write `stub.sh`, a script that creates, invokes, configures and versions the `hello-world` Lambda function. This lesson builds on **IAM Roles & STS**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### Lambda starts an environment on demand

Lambda keeps no server running for you. On the first call, AWS starts an execution environment: a small sandboxed container.

- **Cold start:** no environment is free. AWS downloads your code, starts the runtime, runs your top-level code, then runs the handler. This adds tens of milliseconds for small interpreted packages. It adds up to a few seconds for the JVM, large dependency trees or VPC networking.
- **Warm start:** an environment from an earlier call is still alive. The handler runs at once, with no start cost.

Lambda keeps environments alive for a while after use, but it gives no guarantee.

### Code outside the handler runs once per cold start

Put expensive setup at module scope: SDK clients, database connections and config loading. You then pay its cost once per cold start, not once per call. Keep the handler body small.

```js
// Runs once per cold start
const db = new DynamoDBClient({});

exports.handler = async (event) => {
  // Runs on every call
  return {
    statusCode: 200,
    body: "hello",
  };
};
```

### Each concurrent call gets its own environment

Lambda does not queue requests onto a fixed thread pool. Each call that runs at the same time gets its own environment. The account has a regional concurrency limit, and a support request can raise it.

`--reserved-concurrent-executions` caps or guarantees the part of that pool that one function uses. Other functions in the account and region then cannot starve it, and it cannot starve them.

### `create-function` needs a runtime, a handler, a role and a package

```bash
zip function.zip index.js

aws lambda create-function \
  --function-name hello-world \
  --runtime nodejs18.x \
  --handler index.handler \
  --role "$ROLE_ARN" \
  --zip-file fileb://function.zip
```

- `--runtime`: the managed language runtime, for example `nodejs18.x`, `python3.12` or `java17`. Use `provided.al2` for a custom runtime or binary.
- `--handler`: `file.exportedFunctionName`, the entry point that Lambda calls on each invocation.
- `--role`: the execution role from **IAM Roles & STS**. It sets what the running function can do. It does not control who can create or manage the function.
- `--zip-file`: the deployment package as bytes. Use `fileb://`, not `file://`, because the zip is binary.

### `invoke` waits for the result by default

```bash
aws lambda invoke \
  --function-name hello-world \
  --payload '{"name": "world"}' \
  --cli-binary-format raw-in-base64-out \
  response.json
```

The default `--invocation-type RequestResponse` makes the CLI wait until the function returns. The CLI writes the response body to the output file, here `response.json`.

`--invocation-type Event` starts the function asynchronously and returns at once. The next concept covers async calls, destinations and DLQs.

CLI v2 needs `--cli-binary-format raw-in-base64-out` for a plain JSON payload. Without it, the CLI expects a base64-encoded payload.

### Environment variables hold config

```bash
aws lambda update-function-configuration \
  --function-name hello-world \
  --environment \
  "Variables={LOG_LEVEL=info}"
```

Environment variables pass config such as table names, feature flags and external endpoints. You keep them out of the deployment package. The same package then runs in dev, staging and prod with different values.

### Memory also sets CPU

```bash
aws lambda update-function-configuration \
  --function-name hello-world \
  --timeout 10 \
  --memory-size 512
```

- `--timeout`: the maximum seconds one invocation can run before Lambda stops it. The limit is 900 seconds (15 minutes). Lambda does not retry a synchronous call that times out. The caller gets the error and decides what to do.
- `--memory-size`: memory in MB, from 128 to 10240. Lambda gives the function CPU in proportion to its memory.

A CPU-bound function often runs faster with more memory, for example JSON parsing, image processing or compression. You buy more CPU. The price per millisecond goes up, but the total cost can go down because the function finishes sooner. Many engineers miss this.

### Versions freeze code, and aliases point to versions

Each `update-function-code` overwrites the mutable `$LATEST` version in place. Production traffic on `$LATEST` is risky. `publish-version` freezes an immutable snapshot.

```bash
aws lambda publish-version \
  --function-name hello-world

aws lambda create-alias \
  --function-name hello-world \
  --name prod \
  --function-version 1
```

An alias, such as `prod` or `staging`, is a named, stable pointer to one version. It can also split traffic between two versions by weight, for a gradual rollout. Callers invoke the alias, not `$LATEST` or a version number. To promote a new version, you update one alias, not the config of every caller.

### Lambda scales to zero, with limits

Lambda scales per invocation and costs nothing when idle. You pay only for invocation time. In exchange, you accept cold starts, a 15-minute limit per invocation and no guaranteed state between requests. Environment reuse is an optimization, not a contract.

Lambda fits spiky, event-driven work. A long-running container or EC2 service fits work that needs latency under 10 ms on every request, or runs longer than 15 minutes.

## Watch out

- Code outside the handler runs once per cold start. A bug that "happens sometimes" often happens on every cold start.
- `file://` on a binary zip can corrupt the upload. Always use `fileb://` for binary payloads.
- More memory for a slow function is a real optimization, not a workaround. Test a higher `--memory-size` before you rewrite code.
- An alias rollback does not roll back IAM. The older version runs with the current execution role and account resources.

## The task

Write `stub.sh` to deploy and configure a Node.js function on LocalStack. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Write `index.js` with a heredoc. Its `exports.handler` returns `{ statusCode: 200, body: "hello" }`.
2. Zip `index.js` into `function.zip`. The line starts with `zip function.zip`.
3. Create the function `hello-world` with `--runtime nodejs18.x` and `--handler index.handler`.
4. Give it `--role arn:aws:iam::000000000000:role/lambda-exec-role` and `--zip-file fileb://function.zip`.
5. Invoke it synchronously with the payload `{"name": "world"}`. Write the response to `response.json`.
6. Use `--cli-binary-format raw-in-base64-out` on the invoke call.
7. Set the environment variables `TABLE_NAME=Orders` and `LOG_LEVEL=info`.
8. Set `--timeout 10` and `--memory-size 512`.
9. Publish a version. Then create the alias `prod` for version `1`.

The finished script makes these calls:

```bash
cat > index.js <<'EOF'
exports.handler = async () => {
  return { statusCode: 200,
    body: "hello" };
};
EOF
zip function.zip index.js

aws lambda create-function \
  --function-name hello-world \
  --runtime nodejs18.x \
  --handler index.handler \
  --role arn:aws:iam::000000000000:role/lambda-exec-role \
  --zip-file fileb://function.zip

aws lambda invoke \
  --function-name hello-world \
  --payload '{"name": "world"}' \
  --cli-binary-format raw-in-base64-out \
  response.json

aws lambda update-function-configuration \
  --function-name hello-world \
  --environment \
  "Variables={TABLE_NAME=Orders,LOG_LEVEL=info}"

aws lambda update-function-configuration \
  --function-name hello-world \
  --timeout 10 --memory-size 512

aws lambda publish-version \
  --function-name hello-world

aws lambda create-alias \
  --function-name hello-world \
  --name prod --function-version 1
```

### Run it for real

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
cat response.json
```
