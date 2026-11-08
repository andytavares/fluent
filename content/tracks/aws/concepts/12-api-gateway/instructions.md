## What you build

You write `stub.sh`, a script that puts a REST API in front of a Lambda function, deploys it, meters a partner and allows CORS. Most Lambda-backed APIs sit behind API Gateway. This lesson builds on **Lambda Functions** and **Lambda Event Sources**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### REST APIs and HTTP APIs are two products

API Gateway has two separate API types, not two modes of one product.

| | REST API | HTTP API |
|---|---|---|
| CLI | `apigateway` | `apigatewayv2` |
| Features | Full | Lean |
| Cost | Higher | Up to ~70% less |
| Latency | Higher | Lower |

- **REST API features:** usage plans, API keys, request and response transformation, WAF integration and private VPC endpoints. Use it for API-key metering, complex transformation or older feature needs.
- **HTTP API features:** JWT and Lambda authorizers and simpler routing, with no usage plans. Use it for simple Lambda or HTTP backends and cost-sensitive, high-traffic services.

Use HTTP APIs for new Lambda-backed services, unless you need a REST-only feature. Usage plans and API keys are the most common reason to choose REST. This track uses the REST commands (`aws apigateway`) because it teaches usage plans.

### A REST API is a tree of resources, methods and integrations

A resource is a URL path segment. Each resource has one or more HTTP methods. Each method connects to an integration: the thing that handles the request.

```bash
aws apigateway create-rest-api \
  --name orders-api

# Every API starts with a root "/".
# Get its id to attach children.
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --query 'items[0].id' --output text)

aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --parent-id "$ROOT_ID" \
  --path-part orders

aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --authorization-type NONE
```

### Lambda proxy integration passes the whole request

```bash
aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "$URI"
```

`$URI` has this format:

```
arn:aws:apigateway:{region}:lambda:path
  /2015-03-31/functions/{function-arn}
  /invocations
```

With `AWS_PROXY`, API Gateway sends the entire raw request to your function as one JSON event. The event holds headers, the query string, path parameters and the body. Your function returns `statusCode`, `headers` and `body`. You write no mapping templates.

The `AWS` (non-proxy) type needs Velocity Template Language (VTL) mapping templates for the request and the response. That is much more setup, for fine-grained transformation that most Lambda-backed APIs do not need. Use `AWS_PROXY` unless you must transform inside API Gateway and not in your function.

### Changes go live only when you deploy to a stage

```bash
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name prod
```

A deployment is an immutable snapshot of the whole API configuration. A stage, such as `prod`, `staging` or `dev`, is a named pointer to one deployment. Each stage has its own URL and stage variables. For REST APIs, it also has its own throttling and logging settings.

You can deploy a snapshot to `staging` and test it at its own URL. Then you point `prod` at the same deployment, with no second deploy.

### Usage plans meter API consumers

Use a usage plan to meter and rate-limit external consumers, such as partner integrations or paid API tiers.

```bash
aws apigateway create-usage-plan \
  --name partner-tier \
  --throttle burstLimit=20,rateLimit=10 \
  --quota limit=10000,period=MONTH \
  --api-stages apiId="$API_ID",stage=prod

aws apigateway create-api-key \
  --name partner-acme-corp --enabled

aws apigateway create-usage-plan-key \
  --usage-plan-id "$PLAN_ID" \
  --key-id "$KEY_ID" \
  --key-type API_KEY
```

A usage plan attaches to specific stages of specific APIs. It enforces a burst and steady-state throttle, and a quota over a longer period. You issue one API key per consumer and link it to the plan with `create-usage-plan-key`.

An API key is not authentication. The client sends it as a plain header, `x-api-key`. It only identifies whose usage to meter and throttle. For access control, add a real authorizer: IAM, Cognito or a Lambda authorizer.

### CORS needs an `OPTIONS` method and headers on the real response

A browser that calls your API from another origin first sends a preflight `OPTIONS` request. The API must answer it, and must send the right headers on the real response too.

```bash
aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --authorization-type NONE

aws apigateway put-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "$CORS_HEADERS"
```

`$CORS_HEADERS` maps each header to `true`. It lists `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`, each with the prefix `method.response.header.`.

Each method that needs CORS needs both halves. The `OPTIONS` method returns the `Access-Control-Allow-*` headers. The real `GET` or `POST` response sends the same headers. A CORS failure is almost always one missing half.

### Your routes live in API Gateway, not in code

In Express or Flask, `app.get("/orders", ...)` defines a route in code. In API Gateway, resources and methods are infrastructure, and API Gateway adds throttling, metering and authorizers. With `AWS_PROXY`, your handler still feels like a normal handler, but it runs once per request, not once per process.

## Watch out

- Changes reach real traffic only after `create-deployment` to a stage. A forgotten redeploy keeps the old behavior.
- The `AWS_PROXY` `--uri` uses the API Gateway ARN format, not the bare Lambda function ARN.
- API Gateway needs `lambda:InvokeFunction` on the target function, through `lambda add-permission`.
- The integration URI alone grants no invoke rights. This is the same mechanism as S3 notifications.
- A usage plan applies only to stages in its `--api-stages`. A plan with no stage does nothing.

## The task

Write `stub.sh` to build the `orders-api` REST API. `API_ID`, `ROOT_ID` and `RESOURCE_ID` are already exported. They point at a real REST API and resource. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Create a REST API with `--name orders-api`.
2. Create a child resource with `--path-part orders` under the root resource.
3. Add a `POST` method on that resource with `--authorization-type NONE`.
4. Connect the method to a `--type AWS_PROXY` integration for the function `create-order`.
5. Deploy the API with `--stage-name prod`.
6. Create the usage plan `partner-tier` with `burstLimit=20,rateLimit=10` and a quota of `limit=10000,period=MONTH`.
7. Attach the plan to `stage=prod` of `$API_ID`.
8. Create the enabled API key `partner-acme-corp`.
9. Add an `OPTIONS` method on the `orders` resource, for CORS.
10. Give it a method response that exposes the three `Access-Control-Allow-*` headers.

The function ARN is `arn:aws:lambda:us-east-1:000000000000:function:create-order`.

The finished script makes these calls:

```bash
aws apigateway create-rest-api \
  --name orders-api

aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --parent-id "$ROOT_ID" \
  --path-part orders

aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --authorization-type NONE

FN=arn:aws:lambda:us-east-1:000000000000
URI=arn:aws:apigateway:us-east-1:lambda
URI=$URI:path/2015-03-31/functions
URI=$URI/$FN:function:create-order
URI=$URI/invocations

aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "$URI"

aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name prod

aws apigateway create-usage-plan \
  --name partner-tier \
  --throttle burstLimit=20,rateLimit=10 \
  --quota limit=10000,period=MONTH \
  --api-stages apiId="$API_ID",stage=prod

aws apigateway create-api-key \
  --name partner-acme-corp --enabled

aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --authorization-type NONE

aws apigateway put-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{
  "method.response.header.Access-Control-Allow-Origin": true,
  "method.response.header.Access-Control-Allow-Methods": true,
  "method.response.header.Access-Control-Allow-Headers": true
}'
```

### Run it for real

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
```
