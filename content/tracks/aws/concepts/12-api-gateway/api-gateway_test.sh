#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.sh"

passed=0
failed=0

check() {
  local name="$1"; shift
  if "$@" &>/dev/null; then
    echo "  PASS: $name"
    passed=$((passed + 1))
  else
    echo "  FAIL: $name"
    failed=$((failed + 1))
  fi
}

echo "Running api-gateway tests against stub.sh..."

check "creates REST API orders-api"          grep -qE 'apigateway create-rest-api'               "$STUB"
check "api name is orders-api"               grep -qE -- '--name orders-api'                      "$STUB"
check "creates child resource"               grep -qE 'apigateway create-resource'                "$STUB"
check "resource path-part is orders"         grep -qE -- '--path-part orders'                     "$STUB"
check "adds POST method"                     grep -qE -- '--http-method POST'                     "$STUB"
check "method authorization is NONE"         grep -qE -- '--authorization-type NONE'               "$STUB"
check "wires Lambda proxy integration"       grep -qE -- '--type AWS_PROXY'                        "$STUB"
check "integration targets create-order fn"  grep -qE 'function:create-order'                      "$STUB"
check "deploys the API"                      grep -qE 'apigateway create-deployment'                "$STUB"
check "deployment stage is prod"             grep -qE -- '--stage-name prod'                        "$STUB"
check "creates usage plan partner-tier"      grep -qE 'apigateway create-usage-plan'                "$STUB"
check "usage plan throttle configured"       grep -qE 'burstLimit=20,rateLimit=10'                  "$STUB"
check "usage plan quota is 10000/MONTH"      grep -qE 'limit=10000,period=MONTH'                    "$STUB"
check "usage plan attached to prod stage"    grep -qE 'stage=prod'                                  "$STUB"
check "creates an API key"                   grep -qE 'apigateway create-api-key'                   "$STUB"
check "api key name is partner-acme-corp"    grep -qE -- '--name partner-acme-corp'                 "$STUB"
check "adds OPTIONS method for CORS"         grep -qE -- '--http-method OPTIONS'                    "$STUB"
check "method response exposes CORS headers" grep -qE 'Access-Control-Allow-Origin'                 "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
