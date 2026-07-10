#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# Assume API_ID, ROOT_ID, RESOURCE_ID are already exported by the caller.

# TODO: apigateway create-rest-api --name orders-api

# TODO: apigateway create-resource --rest-api-id "$API_ID" --parent-id "$ROOT_ID" --path-part orders

# TODO: apigateway put-method --rest-api-id "$API_ID" --resource-id "$RESOURCE_ID"
#       --http-method POST --authorization-type NONE

# TODO: apigateway put-integration --type AWS_PROXY --http-method POST
#       --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:create-order/invocations

# TODO: apigateway create-deployment --rest-api-id "$API_ID" --stage-name prod

# TODO: apigateway create-usage-plan --name partner-tier
#       --throttle burstLimit=20,rateLimit=10 --quota limit=10000,period=MONTH
#       --api-stages apiId="$API_ID",stage=prod

# TODO: apigateway create-api-key --name partner-acme-corp --enabled

# TODO: apigateway put-method --http-method OPTIONS --authorization-type NONE
# TODO: apigateway put-method-response --http-method OPTIONS --status-code 200
#       exposing Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers
