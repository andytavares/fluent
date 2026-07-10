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

echo "Running cli-and-localstack tests against stub.sh..."

check "sets AWS_ACCESS_KEY_ID"            grep -qE 'AWS_ACCESS_KEY_ID=test'           "$STUB"
check "sets AWS_SECRET_ACCESS_KEY"        grep -qE 'AWS_SECRET_ACCESS_KEY=test'       "$STUB"
check "sets AWS_DEFAULT_REGION"           grep -qE 'AWS_DEFAULT_REGION=us-east-1'     "$STUB"
check "defines ENDPOINT_URL to localstack" grep -qE 'ENDPOINT_URL=.*4566'             "$STUB"
check "runs sts get-caller-identity"      grep -qE 'sts get-caller-identity'          "$STUB"
check "uses --endpoint-url flag"          grep -qE -- '--endpoint-url'                "$STUB"
check "creates bucket fluent-cli-demo"    grep -qE 's3 mb s3://fluent-cli-demo'        "$STUB"
check "lists buckets via s3api"           grep -qE 's3api list-buckets'               "$STUB"
check "uses --output table"               grep -qE -- '--output table'                "$STUB"
check "uses --query JMESPath expression"  grep -qE -- "--query 'Buckets\[\]\.Name'"   "$STUB"
check "uses --output text for the query"  grep -qE -- '--output text'                 "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
