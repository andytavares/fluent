# API Gateway

## What you'll learn

API Gateway is the front door most Lambda-backed APIs sit behind. This concept covers the REST vs HTTP API split, the resource/method/integration model (especially Lambda proxy integration, the pattern you'll use nearly every time), stages and deployments, usage plans/API keys for metering external consumers, and CORS. Builds on `lambda-functions`.

## Key concepts

### REST APIs vs HTTP APIs — two distinct products

API Gateway ships two genuinely separate API types, not just two "modes" of one:

| | REST API (`apigateway`) | HTTP API (`apigatewayv2`) |
|---|---|---|
| Feature set | Full: usage plans, API keys, request/response transformation, WAF integration, private VPC endpoints | Leaner: JWT/Lambda authorizers, simpler routing, no usage plans |
| Latency/cost | Higher latency, higher per-request cost | Lower latency, up to ~70% cheaper |
| Best for | API-key metering, complex request transformation, legacy feature needs | Simple Lambda/HTTP-backed APIs, cost-sensitive high-traffic services |

Default to HTTP APIs for new Lambda-backed services unless you specifically need a REST-API-only feature (usage plans and API keys, covered below, are the most common reason to still reach for REST). This track uses the REST API commands (`aws apigateway ...`) since usage plans are part of the curriculum.

### Resources, methods, integrations

A REST API is a tree of **resources** (URL path segments), each with one or more HTTP **methods**, each method wired to an **integration** (what actually handles the request):

```bash
aws --endpoint-url http://localhost:4566 apigateway create-rest-api --name orders-api

# Every API starts with a root resource "/"; find its id to attach children
ROOT_ID=$(aws --endpoint-url http://localhost:4566 apigateway get-resources \
  --rest-api-id "$API_ID" --query 'items[0].id' --output text)

aws --endpoint-url http://localhost:4566 apigateway create-resource \
  --rest-api-id "$API_ID" --parent-id "$ROOT_ID" --path-part orders

aws --endpoint-url http://localhost:4566 apigateway put-method \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method POST --authorization-type NONE
```

### Lambda proxy integration

```bash
aws --endpoint-url http://localhost:4566 apigateway put-integration \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:create-order/invocations
```

`AWS_PROXY` ("Lambda proxy integration") is the pattern to default to: API Gateway forwards the **entire raw request** (headers, query string, path parameters, body) to your function as one JSON event object, and expects your function to return a specific shape back (`statusCode`, `headers`, `body`) — no request/response mapping templates to hand-write. The alternative, `AWS` (non-proxy), requires you to author Velocity Template Language (VTL) mapping templates on both the request and response side — significantly more setup for a benefit (fine-grained transformation) that most Lambda-backed APIs don't need. Always reach for `AWS_PROXY` unless you have a specific reason to transform the request/response inside API Gateway itself rather than in your function code.

### Stages and deployments

Configuration changes to resources/methods/integrations don't take live effect until **deployed** to a **stage**:

```bash
aws --endpoint-url http://localhost:4566 apigateway create-deployment \
  --rest-api-id "$API_ID" --stage-name prod
```

A **deployment** is an immutable snapshot of the whole API's configuration at that moment; a **stage** (`prod`, `staging`, `dev`) is a named, addressable pointer to one deployment, with its own URL, its own stage variables, and (for REST APIs) its own throttling/logging settings. This split lets you deploy a new snapshot to `staging`, test it at its own URL, then point `prod` at that same deployment once verified — without redeploying twice.

### Usage plans and API keys

For metering/rate-limiting external API consumers (partner integrations, paid API tiers):

```bash
aws --endpoint-url http://localhost:4566 apigateway create-usage-plan \
  --name partner-tier \
  --throttle burstLimit=20,rateLimit=10 \
  --quota limit=10000,period=MONTH \
  --api-stages apiId="$API_ID",stage=prod

aws --endpoint-url http://localhost:4566 apigateway create-api-key \
  --name partner-acme-corp --enabled

aws --endpoint-url http://localhost:4566 apigateway create-usage-plan-key \
  --usage-plan-id "$PLAN_ID" --key-id "$KEY_ID" --key-type API_KEY
```

A usage plan is attached to specific stages of specific APIs and enforces both a burst/steady-state throttle and a longer-period quota; an API key is issued per consumer and associated with the plan via `create-usage-plan-key`. The API key itself is not an authentication/authorization mechanism on its own (it's sent as a plain header, `x-api-key`) — it's purely for identifying which consumer's usage to meter and throttle; pair it with a real authorizer (IAM, Cognito, Lambda authorizer) if you need actual access control.

### CORS

A browser calling your API from a different origin needs the API to answer the browser's preflight `OPTIONS` request correctly, and to echo the right headers on the real response:

```bash
aws --endpoint-url http://localhost:4566 apigateway put-method \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS --authorization-type NONE

aws --endpoint-url http://localhost:4566 apigateway put-method-response \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS --status-code 200 \
  --response-parameters '{
    "method.response.header.Access-Control-Allow-Origin": true,
    "method.response.header.Access-Control-Allow-Methods": true,
    "method.response.header.Access-Control-Allow-Headers": true
  }'
```

Every method that needs CORS support requires both an `OPTIONS` method returning the `Access-Control-Allow-*` headers, **and** those same headers echoed on the actual `GET`/`POST`/etc. method's response — CORS failures are almost always one of these two halves being missing, not a fundamental misconfiguration.

## vs other tools

| | API Gateway (Lambda proxy) | A traditional reverse proxy (nginx) in front of app servers | A framework's built-in router (Express, Flask) |
|---|---|---|---|
| Scaling | Fully managed, scales with Lambda concurrency | You scale the proxy and the backends | You scale the whole process |
| Routing config | API definition (resources/methods) as infrastructure | Config file (`nginx.conf`) | Code (`app.get("/orders", ...)`) |
| Auth/throttling/metering | Built-in (usage plans, authorizers, WAF) | Bolt-on (external modules/services) | Bolt-on (middleware) |

The mental shift coming from Express/Flask: your routing table is API Gateway's `resources`/`methods`, not code — but with `AWS_PROXY` integration, the actual request handling still feels like a normal handler function, just invoked once per request instead of once per process lifetime.

## Watch out

- **Nothing you configure takes effect against real traffic until `create-deployment` (to a stage) is run again** — a common "I changed the integration but the API still does the old thing" bug is simply forgetting to redeploy.
- **`AWS_PROXY`'s `--uri` must be the API Gateway–specific ARN format** (`arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/{function-arn}/invocations`), not the bare Lambda function ARN — a common copy-paste mistake when wiring integrations by hand.
- **API Gateway also needs its own `lambda:InvokeFunction` permission on the target function** (via `lambda add-permission`, same mechanism as the S3 notification concept) — the integration URI alone doesn't grant invoke rights.
- **A usage plan's quota/throttle only applies to stages it's explicitly attached to** (`--api-stages`) — creating a usage plan without attaching it to your API's stage silently does nothing.

## The task

Fill in `stub.sh` so it, in order (assume `API_ID`, `ROOT_ID`, and `RESOURCE_ID` are already exported as environment variables pointing at a real REST API/resource):

1. Creates a REST API named `orders-api`.
2. Creates a child resource `orders` under the root resource.
3. Adds a `POST` method on that resource with `--authorization-type NONE`.
4. Wires that method to a Lambda proxy integration (`--type AWS_PROXY`) targeting the function `create-order`.
5. Deploys the API to a stage named `prod`.
6. Creates a usage plan named `partner-tier` with `burstLimit=20,rateLimit=10` and a monthly quota of `10000`, attached to the `prod` stage of `$API_ID`.
7. Creates an API key named `partner-acme-corp`, enabled.
8. Adds an `OPTIONS` method on the `orders` resource (for CORS) with a method response exposing `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
```
