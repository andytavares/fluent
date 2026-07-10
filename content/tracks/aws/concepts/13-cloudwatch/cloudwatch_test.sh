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

echo "Running cloudwatch tests against stub.sh..."

check "publishes custom metric data"          grep -qE 'cloudwatch put-metric-data'               "$STUB"
check "metric namespace is Fluent/Orders"     grep -qE -- '--namespace "Fluent/Orders"'            "$STUB"
check "metric name is OrdersProcessed"        grep -qE -- '--metric-name OrdersProcessed'          "$STUB"
check "metric has dimensions"                 grep -qE 'Environment=prod,Service=order-processor'  "$STUB"
check "creates a metric alarm"                grep -qE 'cloudwatch put-metric-alarm'               "$STUB"
check "alarm name is high-error-rate"         grep -qE -- '--alarm-name high-error-rate'           "$STUB"
check "alarm period is 60"                    grep -qE -- '--period 60'                             "$STUB"
check "alarm evaluation-periods is 3"         grep -qE -- '--evaluation-periods 3'                  "$STUB"
check "alarm threshold is 5"                  grep -qE -- '--threshold 5'                            "$STUB"
check "alarm comparison operator set"         grep -qE 'GreaterThanThreshold'                        "$STUB"
check "alarm treat-missing-data notBreaching" grep -qE -- '--treat-missing-data notBreaching'         "$STUB"
check "creates log group"                     grep -qE 'logs create-log-group'                       "$STUB"
check "log group name is /fluent/order-processor" grep -qE '/fluent/order-processor'                  "$STUB"
check "creates log stream"                    grep -qE 'logs create-log-stream'                       "$STUB"
check "log stream name is 2024-01-15"         grep -qE '2024-01-15'                                    "$STUB"
check "writes a log event"                    grep -qE 'logs put-log-events'                           "$STUB"
check "log event message mentions payment declined" grep -qE 'payment declined'                        "$STUB"
check "creates a metric filter"               grep -qE 'logs put-metric-filter'                        "$STUB"
check "metric filter name is payment-declined-count" grep -qE -- '--filter-name payment-declined-count' "$STUB"
check "metric filter transforms into PaymentDeclinedCount" grep -qE 'PaymentDeclinedCount'               "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
