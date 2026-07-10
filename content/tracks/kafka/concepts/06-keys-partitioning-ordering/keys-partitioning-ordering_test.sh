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

echo "Running keys-partitioning-ordering tests against stub.properties..."

check "topic metadata is orders"             grep -qE '^#\s*topic\s*=\s*orders\s*$' "$STUB"
check "key metadata is customer_id"          grep -qE '^#\s*key\s*=\s*customer_id\s*$' "$STUB"
check "partitions metadata is 12"            grep -qE '^#\s*partitions\s*=\s*12\s*$' "$STUB"
check "uses DefaultPartitioner"              grep -qE '^partitioner\.class=org\.apache\.kafka\.clients\.producer\.internals\.DefaultPartitioner\s*$' "$STUB"
check "ordering-guarantee is per-partition-only" grep -qE '^#\s*ordering-guarantee\s*=\s*per-partition-only\s*$' "$STUB"
check "hot-key-mitigation is salted-composite-key" grep -qE '^#\s*hot-key-mitigation\s*=\s*salted-composite-key\s*$' "$STUB"
check "does not claim global ordering"       bash -c "! grep -qiE '^#\s*ordering-guarantee\s*=\s*(global|topic-wide)\s*$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
