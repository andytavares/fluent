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

echo "Running offset-management tests against stub.properties..."

check "group.id is payment-processors"       grep -qE '^group\.id=payment-processors\s*$' "$STUB"
check "enable.auto.commit is false"          grep -qE '^enable\.auto\.commit=false\s*$' "$STUB"
check "auto.offset.reset is earliest"        grep -qE '^auto\.offset\.reset=earliest\s*$' "$STUB"
check "commit-timing is after-processing"    grep -qE '^#\s*commit-timing\s*=\s*after-processing\s*$' "$STUB"
check "shutdown-commit is sync-final-commit" grep -qE '^#\s*shutdown-commit\s*=\s*sync-final-commit\s*$' "$STUB"
check "does not reset to latest"             bash -c "! grep -qE '^auto\.offset\.reset=latest\s*\$' '$STUB'"
check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
