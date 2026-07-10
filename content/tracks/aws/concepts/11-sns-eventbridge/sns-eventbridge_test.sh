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

echo "Running sns-eventbridge tests against stub.sh..."

check "creates SNS topic order-events"        grep -qE 'sns create-topic'                        "$STUB"
check "topic name is order-events"            grep -qE -- '--name order-events'                   "$STUB"
check "subscribes a queue to the topic"       grep -qE 'sns subscribe'                             "$STUB"
check "subscription protocol is sqs"          grep -qE -- '--protocol sqs'                          "$STUB"
check "subscription targets orders-queue"     grep -qE 'sqs:us-east-1:000000000000:orders-queue'   "$STUB"
check "enables RawMessageDelivery"            grep -qE 'RawMessageDelivery'                         "$STUB"
check "raw message delivery value is true"    grep -qE -- '--attribute-value "true"'                 "$STUB"
check "sets a FilterPolicy"                   grep -qE 'FilterPolicy'                                "$STUB"
check "filter policy matches OrderShipped"    grep -qE 'OrderShipped'                                "$STUB"
check "filter policy matches OrderCancelled"  grep -qE 'OrderCancelled'                              "$STUB"
check "creates EventBridge rule"              grep -qE 'events put-rule'                             "$STUB"
check "rule name is high-value-orders"        grep -qE -- '--name high-value-orders'                 "$STUB"
check "event pattern matches source orders.service" grep -qE 'orders\.service'                       "$STUB"
check "event pattern matches detail-type OrderPlaced" grep -qE 'OrderPlaced'                          "$STUB"
check "event pattern has numeric threshold 500" grep -qE '"numeric":\s*\[">=",\s*500\]'               "$STUB"
check "adds a target to the rule"             grep -qE 'events put-targets'                          "$STUB"
check "target references vip-orders-queue"    grep -qE 'vip-orders-queue'                            "$STUB"
check "has an answer comment about EventBridge vs SNS" grep -qE '# answer:'                           "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
