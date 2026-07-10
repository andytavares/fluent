# Lambda Functions

## What you'll learn

Lambda runs your code without you managing a server, but "serverless" hides a specific execution model with real performance and cost consequences: cold starts, concurrency limits, and a direct memory-to-CPU tradeoff. This concept covers creating, invoking, and configuring a function, plus versions and aliases for safe rollout.

## Key concepts

### The execution model: cold and warm starts

A Lambda function doesn't run continuously — AWS provisions an execution environment (a lightweight sandboxed container) **on demand**, the first time it's needed:

- **Cold start**: no existing environment available. AWS downloads your code, starts the runtime, runs any top-level initialization code, *then* runs your handler. This adds real latency — anywhere from tens of milliseconds (interpreted languages, small packages) to a few seconds (JVM, large dependency trees, provisioned VPC networking).
- **Warm start**: an execution environment from a previous invocation is still around (Lambda keeps them alive for a while after use, opportunistically). The handler runs immediately, no init cost.

This is why code outside your handler function (SDK client construction, DB connection setup, config loading) only pays its cost once per cold start, and why organizing a function to do as little as possible in the actual per-invocation handler body — with expensive setup hoisted to module/global scope — is the standard performance pattern.

**Concurrency**: each simultaneous invocation gets its *own* execution environment — Lambda doesn't queue requests onto a fixed pool the way a traditional server's thread pool does. An account has a default regional concurrency limit (a safety ceiling, raisable via support request); a function can also have `--reserved-concurrent-executions` set to cap (or guarantee) how much of that pool it can use, isolating it from being starved by, or from starving, other functions in the same account/region.

### Creating a function

```bash
zip function.zip index.js

aws --endpoint-url http://localhost:4566 lambda create-function \
  --function-name hello-world \
  --runtime nodejs18.x \
  --handler index.handler \
  --role arn:aws:iam::000000000000:role/lambda-exec-role \
  --zip-file fileb://function.zip
```

| Flag | Meaning |
|---|---|
| `--runtime` | The managed language runtime (`nodejs18.x`, `python3.12`, `java17`, ...) — or `provided.al2` for a custom runtime/binary |
| `--handler` | `file.exportedFunctionName` — the entry point Lambda calls per invocation |
| `--role` | The execution role (from `iam-roles-sts`) — this is what the *running function* is allowed to do, not who's allowed to create/manage the function itself |
| `--zip-file fileb://...` | Deployment package, as bytes (`fileb://`, not `file://`, since it's binary) |

### Invoking

```bash
aws --endpoint-url http://localhost:4566 lambda invoke \
  --function-name hello-world \
  --payload '{"name": "world"}' \
  --cli-binary-format raw-in-base64-out \
  response.json
```

`invoke` is synchronous by default (`--invocation-type RequestResponse`) — the CLI blocks until the function returns, and writes its response body to the given output file (`response.json` here). `--invocation-type Event` fires it asynchronously and returns immediately (covered further in the next concept, alongside destinations and DLQs). `--cli-binary-format raw-in-base64-out` is required on CLI v2 for a plain JSON payload — without it the CLI expects the payload pre-base64-encoded.

### Environment variables

```bash
aws --endpoint-url http://localhost:4566 lambda update-function-configuration \
  --function-name hello-world \
  --environment "Variables={TABLE_NAME=Orders,LOG_LEVEL=info}"
```

Environment variables are the standard way to pass configuration (table names, feature flags, external endpoints) without baking them into the deployment package — the same package can be deployed to dev/staging/prod with different variable values.

### Timeout and memory — and why memory is really "CPU"

```bash
aws --endpoint-url http://localhost:4566 lambda update-function-configuration \
  --function-name hello-world \
  --timeout 10 \
  --memory-size 512
```

- **`--timeout`**: max seconds a single invocation may run before Lambda kills it (max 15 minutes / 900s). There's no default retry on timeout for synchronous invokes — the caller gets an error and decides what to do.
- **`--memory-size`**: allocated in MB (128–10240). This is **also** how much vCPU your function gets — Lambda allocates CPU **proportionally to configured memory**, not independently. A function that's slow due to CPU-bound work (JSON parsing, image processing, compression) often gets *faster* by turning memory up, even though it "only" needed more memory on paper — you're actually buying more CPU. This is one of the most common Lambda cost/performance misunderstandings: a memory bump can lower total cost even though the per-millisecond price goes up, because the function finishes proportionally faster.

### Versions and aliases

Every `update-function-code` overwrites the mutable `$LATEST` version in place — risky to point production traffic at directly. Publishing a version freezes an immutable snapshot:

```bash
aws --endpoint-url http://localhost:4566 lambda publish-version \
  --function-name hello-world

aws --endpoint-url http://localhost:4566 lambda create-alias \
  --function-name hello-world \
  --name prod \
  --function-version 1
```

An **alias** (`prod`, `staging`) is a named, stable pointer to a specific version (or split across two versions by weight, for gradual rollout) — callers invoke the alias, not `$LATEST` or a raw version number, so promoting a new version is a one-line alias update instead of redeploying every caller's configuration.

## vs other tools

| | Lambda | A long-running container/EC2 service |
|---|---|---|
| Scaling unit | Per-invocation, automatic | Per-instance/pod, manual or autoscaler-driven |
| Idle cost | Zero (billed only for actual invocation time) | Pay for the instance/pod whether or not it's handling traffic |
| Startup latency | Cold starts, per execution environment | Paid once at deploy time, not per request |
| Max single execution | 15 minutes | Unbounded |
| State between requests | None guaranteed (environment reuse is a best-effort optimization, not a contract) | Whatever you build (in-memory cache, connections) |

Lambda trades "always-on, warm, controllable" for "scales to zero, pay only for use, cold-start tax." It's the right tool for spiky/event-driven workloads and the wrong tool for anything needing sub-10ms guaranteed latency on every single request or execution longer than 15 minutes.

## Watch out

- **Code outside the handler runs once per cold start, not once per invocation** — a bug that looks like "this only happens sometimes" is often actually "this happens on every cold start," which is far more predictable once you know to look there.
- **`--zip-file` requires the `fileb://` prefix, not `file://`** — using `file://` on a binary zip silently corrupts the upload in some CLI versions/contexts; always use `fileb://` for binary payloads.
- **Increasing memory to fix a slow function is a legitimate, common optimization, not a workaround** — profile CPU-bound functions with a higher `--memory-size` before assuming you need to rewrite the code.
- **A function pointed at by an alias still needs its execution role to have current permissions** — rolling back to an older version via alias doesn't roll back the IAM role or any other account-level resource that version depends on.

## The task

Fill in `stub.sh` so it, in order:

1. Writes a one-line Node.js handler to `index.js` (via a heredoc) that returns `{ statusCode: 200, body: "hello" }` from `exports.handler`.
2. Zips it into `function.zip`.
3. Creates a function named `hello-world` with `--runtime nodejs18.x`, `--handler index.handler`, `--role arn:aws:iam::000000000000:role/lambda-exec-role`, and `--zip-file fileb://function.zip`.
4. Invokes it synchronously with payload `{"name": "world"}`, writing the response to `response.json`.
5. Updates its configuration to set environment variables `TABLE_NAME=Orders` and `LOG_LEVEL=info`.
6. Updates its configuration to set `--timeout 10` and `--memory-size 512`.
7. Publishes a version, then creates an alias `prod` pointing at version `1`.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
cat response.json
```
