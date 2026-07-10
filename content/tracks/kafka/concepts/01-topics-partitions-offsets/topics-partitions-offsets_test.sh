#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.properties"

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

echo "Running topics-partitions-offsets tests against stub.properties..."

check "topic metadata is clickstream"        grep -qE '^#\s*topic\s*=\s*clickstream\s*$' "$STUB"
check "partitions metadata is 12"            grep -qE '^#\s*partitions\s*=\s*12\s*$' "$STUB"
check "replication.factor metadata is 3"     grep -qE '^#\s*replication\.factor\s*=\s*3\s*$' "$STUB"
check "cleanup.policy is delete"             grep -qE '^cleanup\.policy=delete\s*$' "$STUB"
check "retention.ms is 7 days"               grep -qE '^retention\.ms=604800000\s*$' "$STUB"
check "min.insync.replicas is 2"             grep -qE '^min\.insync\.replicas=2\s*$' "$STUB"
check "no compact policy leaked in"          bash -c "! grep -qE '^cleanup\.policy=compact\s*$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
