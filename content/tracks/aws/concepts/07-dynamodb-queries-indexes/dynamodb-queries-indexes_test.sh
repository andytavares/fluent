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

echo "Running dynamodb-queries-indexes tests against stub.sh..."

check "runs a query on Orders"                  grep -qE 'dynamodb query'                        "$STUB"
check "query uses key-condition-expression"     grep -qE -- '--key-condition-expression'          "$STUB"
check "key condition targets CUSTOMER#123"      grep -qE 'CUSTOMER#123'                            "$STUB"
check "runs a scan on Orders"                   grep -qE 'dynamodb scan'                            "$STUB"
check "has an answer comment about scan cost"   grep -qE '# answer:.*scan|# answer:.*cost'          "$STUB"
check "query uses filter-expression"            grep -qE -- '--filter-expression'                   "$STUB"
check "filter expression checks Status"         grep -qE 'Status = :status'                         "$STUB"
check "has an answer comment about filter timing" grep -qE '# answer:.*filter'                       "$STUB"
check "update-table adds a GSI"                 grep -qE 'global-secondary-index-updates'           "$STUB"
check "GSI is named StatusIndex"                grep -qE 'StatusIndex'                               "$STUB"
check "GSI partition key is Status"             grep -qE '"AttributeName":\s*"Status"'                "$STUB"
check "GSI projects ALL attributes"             grep -qE 'ProjectionType":\s*"ALL"'                   "$STUB"
check "paginated query uses --page-size 25"     grep -qE -- '--page-size 25'                          "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
