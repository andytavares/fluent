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

echo "Running consumers-and-groups tests against stub.properties..."

check "group.id is clickstream-processors" grep -qE '^group\.id=clickstream-processors\s*$' "$STUB"
check "uses CooperativeStickyAssignor"     grep -qE '^partition\.assignment\.strategy=.*CooperativeStickyAssignor\s*$' "$STUB"
check "session.timeout.ms is 45000"        grep -qE '^session\.timeout\.ms=45000\s*$' "$STUB"
check "heartbeat.interval.ms is 15000"     grep -qE '^heartbeat\.interval\.ms=15000\s*$' "$STUB"
check "max.poll.interval.ms is 300000"     grep -qE '^max\.poll\.interval\.ms=300000\s*$' "$STUB"
check "max.poll.records is 500"            grep -qE '^max\.poll\.records=500\s*$' "$STUB"
check "enable.auto.commit is false"        grep -qE '^enable\.auto\.commit=false\s*$' "$STUB"
check "heartbeat interval is roughly a third of session timeout" bash -c "
  hb=\$(grep -oE '^heartbeat\.interval\.ms=[0-9]+' '$STUB' | cut -d= -f2)
  st=\$(grep -oE '^session\.timeout\.ms=[0-9]+' '$STUB' | cut -d= -f2)
  [[ -n \"\$hb\" && -n \"\$st\" ]] && (( hb * 3 <= st ))
"
check "not using legacy RangeAssignor"     bash -c "! grep -qE 'partition\.assignment\.strategy=.*RangeAssignor\s*\$' '$STUB'"
check "no leftover TODO comments"          bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
