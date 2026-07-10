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

echo "Running sqs tests against stub.sh..."

check "creates standard queue orders-queue"     grep -qE -- '--queue-name orders-queue$'         "$STUB"
check "creates FIFO queue orders-queue.fifo"    grep -qE -- '--queue-name orders-queue\.fifo'    "$STUB"
check "FIFO attribute FifoQueue=true"           grep -qE 'FifoQueue=true'                          "$STUB"
check "FIFO content-based dedup enabled"        grep -qE 'ContentBasedDeduplication=true'          "$STUB"
check "creates DLQ orders-dlq"                  grep -qE -- '--queue-name orders-dlq'              "$STUB"
check "sets a redrive policy"                   grep -qE 'RedrivePolicy'                            "$STUB"
check "redrive policy references orders-dlq arn" grep -qE 'orders-dlq'                              "$STUB"
check "maxReceiveCount is 5"                    grep -qE 'maxReceiveCount.*5'                       "$STUB"
check "sends message to the FIFO queue"         grep -qE 'sqs send-message'                         "$STUB"
check "message body has orderId 456"            grep -qE 'orderId.*456'                             "$STUB"
check "message uses message-group-id"           grep -qE -- '--message-group-id customer-123'       "$STUB"
check "message uses message-deduplication-id"   grep -qE -- '--message-deduplication-id order-456-v1' "$STUB"
check "receives a message with long polling"    grep -qE -- '--wait-time-seconds 20'                 "$STUB"
check "has an answer comment about visibility timeout" grep -qE '# answer:.*visib'                    "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
