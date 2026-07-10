#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# Assume API_ID, ROOT_ID, RESOURCE_ID are already exported by the caller.

aws --endpoint-url "$ENDPOINT_URL" apigateway create-rest-api --name orders-api

aws --endpoint-url "$ENDPOINT_URL" apigateway create-resource \
  --rest-api-id "$API_ID" --parent-id "$ROOT_ID" --path-part orders

aws --endpoint-url "$ENDPOINT_URL" apigateway put-method \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method POST --authorization-type NONE

aws --endpoint-url "$ENDPOINT_URL" apigateway put-integration \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:create-order/invocations

aws --endpoint-url "$ENDPOINT_URL" apigateway create-deployment \
  --rest-api-id "$API_ID" --stage-name prod

aws --endpoint-url "$ENDPOINT_URL" apigateway create-usage-plan \
  --name partner-tier \
  --throttle burstLimit=20,rateLimit=10 \
  --quota limit=10000,period=MONTH \
  --api-stages apiId="$API_ID",stage=prod

aws --endpoint-url "$ENDPOINT_URL" apigateway create-api-key \
  --name partner-acme-corp --enabled

aws --endpoint-url "$ENDPOINT_URL" apigateway put-method \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS --authorization-type NONE

aws --endpoint-url "$ENDPOINT_URL" apigateway put-method-response \
  --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS --status-code 200 \
  --response-parameters '{
    "method.response.header.Access-Control-Allow-Origin": true,
    "method.response.header.Access-Control-Allow-Methods": true,
    "method.response.header.Access-Control-Allow-Headers": true
  }'
