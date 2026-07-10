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

echo "Running lambda-event-sources tests against stub.sh..."

check "grants invoke permission via add-permission"  grep -qE 'lambda add-permission'                 "$STUB"
check "add-permission targets process-upload"        grep -qE -- '--function-name process-upload'     "$STUB"
check "add-permission principal is s3.amazonaws.com"  grep -qE 's3\.amazonaws\.com'                     "$STUB"
check "add-permission source-arn is fluent-uploads"   grep -qE 'arn:aws:s3:::fluent-uploads'            "$STUB"
check "configures bucket notification"               grep -qE 'put-bucket-notification-configuration'  "$STUB"
check "notification triggers on ObjectCreated"       grep -qE 's3:ObjectCreated'                         "$STUB"
check "creates SQS event source mapping"             grep -qE 'lambda create-event-source-mapping'      "$STUB"
check "mapping targets process-order"                grep -qE -- '--function-name process-order'         "$STUB"
check "mapping source is orders-queue"               grep -qE 'orders-queue'                              "$STUB"
check "mapping batch-size is 10"                     grep -qE -- '--batch-size 10'                        "$STUB"
check "mapping reports partial batch failures"       grep -qE 'ReportBatchItemFailures'                   "$STUB"
check "configures async invoke destinations"         grep -qE 'put-function-event-invoke-config'          "$STUB"
check "async invoke max retries is 2"                grep -qE -- '--maximum-retry-attempts 2'              "$STUB"
check "OnSuccess destination configured"             grep -qE 'OnSuccess'                                  "$STUB"
check "OnFailure destination configured"             grep -qE 'OnFailure'                                  "$STUB"
check "has an answer comment"                        grep -qE '# answer:'                                  "$STUB"
check "answer mentions idempotency or reprocessing"  grep -qEi 'idempot|twice|redeliver'                    "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
