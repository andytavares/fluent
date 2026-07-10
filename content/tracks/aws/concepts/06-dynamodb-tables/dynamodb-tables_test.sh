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

echo "Running dynamodb-tables tests against stub.sh..."

check "creates table Orders"                grep -qE 'dynamodb create-table'                "$STUB"
check "table-name Orders"                   grep -qE -- '--table-name Orders'                "$STUB"
check "PK declared as string attribute"     grep -qE 'AttributeName=PK,AttributeType=S'      "$STUB"
check "SK declared as string attribute"     grep -qE 'AttributeName=SK,AttributeType=S'      "$STUB"
check "PK is the HASH key"                  grep -qE 'AttributeName=PK,KeyType=HASH'         "$STUB"
check "SK is the RANGE key"                 grep -qE 'AttributeName=SK,KeyType=RANGE'        "$STUB"
check "billing mode is PAY_PER_REQUEST"     grep -qE -- '--billing-mode PAY_PER_REQUEST'      "$STUB"
check "put-item writes an item"             grep -qE 'dynamodb put-item'                      "$STUB"
check "item has PK CUSTOMER#123"            grep -qE 'CUSTOMER#123'                           "$STUB"
check "item has SK ORDER#456"               grep -qE 'ORDER#456'                              "$STUB"
check "item has Total 89.99"                grep -qE '89\.99'                                  "$STUB"
check "item has Status SHIPPED"             grep -qE 'SHIPPED'                                 "$STUB"
check "get-item reads it back"              grep -qE 'dynamodb get-item'                       "$STUB"
check "has an answer comment about partition key choice" grep -qE '# answer:'                  "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
