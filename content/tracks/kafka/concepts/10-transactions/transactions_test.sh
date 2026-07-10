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

producer_section() {
  awk '/=== transactional producer ===/{p=1; next} /=== downstream consumer ===/{p=0} p' "$STUB"
}
consumer_section() {
  awk '/=== downstream consumer ===/{p=1; next} p' "$STUB"
}
export STUB
export -f producer_section consumer_section

echo "Running transactions tests against stub.properties..."

check "both section markers present" bash -c "
  grep -q '=== transactional producer ===' '$STUB' &&
  grep -q '=== downstream consumer ===' '$STUB'
"

check "producer: transactional.id set"       bash -c "producer_section | grep -qE '^transactional\.id=order-processor-1\s*\$'"
check "producer: idempotence enabled"        bash -c "producer_section | grep -qE '^enable\.idempotence=true\s*\$'"
check "producer: acks=all"                   bash -c "producer_section | grep -qE '^acks=all\s*\$'"
check "producer: transaction.timeout.ms=60000" bash -c "producer_section | grep -qE '^transaction\.timeout\.ms=60000\s*\$'"

check "consumer: isolation.level=read_committed" bash -c "consumer_section | grep -qE '^isolation\.level=read_committed\s*\$'"
check "consumer: enable.auto.commit=false"   bash -c "consumer_section | grep -qE '^enable\.auto\.commit=false\s*\$'"
check "consumer: group.id set"               bash -c "consumer_section | grep -qE '^group\.id=order-processor-consumers\s*\$'"

check "consumer not using read_uncommitted"  bash -c "! (consumer_section | grep -qE '^isolation\.level=read_uncommitted\s*\$')"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
