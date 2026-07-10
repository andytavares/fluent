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

topic_section() {
  awk '/=== topic config ===/{p=1; next} /=== broker config ===/{p=0} p' "$STUB"
}
broker_section() {
  awk '/=== broker config ===/{p=1; next} /=== producer config ===/{p=0} p' "$STUB"
}
producer_section() {
  awk '/=== producer config ===/{p=1; next} p' "$STUB"
}
export STUB
export -f topic_section broker_section producer_section

echo "Running replication-and-isr tests against stub.properties..."

check "all three section markers present" bash -c "
  grep -q '=== topic config ===' '$STUB' &&
  grep -q '=== broker config ===' '$STUB' &&
  grep -q '=== producer config ===' '$STUB'
"

check "topic: replication.factor metadata is 3" bash -c "topic_section | grep -qE '^#\s*replication\.factor\s*=\s*3\s*\$'"
check "topic: min.insync.replicas is 2"       bash -c "topic_section | grep -qE '^min\.insync\.replicas=2\s*\$'"
check "topic: cleanup.policy is delete"       bash -c "topic_section | grep -qE '^cleanup\.policy=delete\s*\$'"

check "broker: default.replication.factor is 3" bash -c "broker_section | grep -qE '^default\.replication\.factor=3\s*\$'"
check "broker: min.insync.replicas is 2"      bash -c "broker_section | grep -qE '^min\.insync\.replicas=2\s*\$'"
check "broker: unclean leader election disabled" bash -c "broker_section | grep -qE '^unclean\.leader\.election\.enable=false\s*\$'"

check "producer: acks=all"                    bash -c "producer_section | grep -qE '^acks=all\s*\$'"
check "producer: idempotence enabled"         bash -c "producer_section | grep -qE '^enable\.idempotence=true\s*\$'"

check "min.insync.replicas never set to 3 (no failure tolerance)" bash -c "! grep -qE '^min\.insync\.replicas=3\s*\$' '$STUB'"
check "no leftover TODO comments"             bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
