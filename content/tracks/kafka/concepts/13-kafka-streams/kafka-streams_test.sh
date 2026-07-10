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

echo "Running kafka-streams tests against stub.properties..."

check "application.id is order-enrichment-app" grep -qE '^application\.id=order-enrichment-app\s*$' "$STUB"
check "processing.guarantee is exactly_once_v2" grep -qE '^processing\.guarantee=exactly_once_v2\s*$' "$STUB"
check "num.stream.threads is 4"              grep -qE '^num\.stream\.threads=4\s*$' "$STUB"
check "state.dir is set"                     grep -qE '^state\.dir=/var/lib/kafka-streams\s*$' "$STUB"
check "cache.max.bytes.buffering is 10MB"    grep -qE '^cache\.max\.bytes\.buffering=10485760\s*$' "$STUB"
check "topology design answer present"       grep -qE '^#\s*topology\s*=\s*orders-KStream-join-catalog-GlobalKTable-aggregate-KTable\s*$' "$STUB"
check "window-type is tumbling-5-minutes"    grep -qE '^#\s*window-type\s*=\s*tumbling-5-minutes\s*$' "$STUB"
check "not using at_least_once guarantee"    bash -c "! grep -qE '^processing\.guarantee=at_least_once\s*\$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
