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

at_most_once() {
  awk '/=== at-most-once ===/{p=1; next} /=== at-least-once ===/{p=0} p' "$STUB"
}
at_least_once() {
  awk '/=== at-least-once ===/{p=1; next} /=== exactly-once ===/{p=0} p' "$STUB"
}
exactly_once() {
  awk '/=== exactly-once ===/{p=1; next} p' "$STUB"
}
export STUB
export -f at_most_once at_least_once exactly_once

echo "Running delivery-semantics tests against stub.properties..."

check "all three section markers present" bash -c "
  grep -q '=== at-most-once ===' '$STUB' &&
  grep -q '=== at-least-once ===' '$STUB' &&
  grep -q '=== exactly-once ===' '$STUB'
"

check "at-most-once: acks=1"                 bash -c "at_most_once | grep -qE '^acks=1\s*\$'"
check "at-most-once: idempotence disabled"   bash -c "at_most_once | grep -qE '^enable\.idempotence=false\s*\$'"
check "at-most-once: auto-commit enabled"    bash -c "at_most_once | grep -qE '^enable\.auto\.commit=true\s*\$'"
check "at-most-once: auto-commit interval"   bash -c "at_most_once | grep -qE '^auto\.commit\.interval\.ms=1000\s*\$'"

check "at-least-once: acks=all"              bash -c "at_least_once | grep -qE '^acks=all\s*\$'"
check "at-least-once: idempotence disabled"  bash -c "at_least_once | grep -qE '^enable\.idempotence=false\s*\$'"
check "at-least-once: retries set to max"    bash -c "at_least_once | grep -qE '^retries=2147483647\s*\$'"
check "at-least-once: manual commit"         bash -c "at_least_once | grep -qE '^enable\.auto\.commit=false\s*\$'"

check "exactly-once: idempotence enabled"    bash -c "exactly_once | grep -qE '^enable\.idempotence=true\s*\$'"
check "exactly-once: transactional.id set"   bash -c "exactly_once | grep -qE '^transactional\.id=order-processor-1\s*\$'"
check "exactly-once: acks=all"               bash -c "exactly_once | grep -qE '^acks=all\s*\$'"
check "exactly-once: read_committed isolation" bash -c "exactly_once | grep -qE '^isolation\.level=read_committed\s*\$'"
check "exactly-once: manual commit"          bash -c "exactly_once | grep -qE '^enable\.auto\.commit=false\s*\$'"

check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
