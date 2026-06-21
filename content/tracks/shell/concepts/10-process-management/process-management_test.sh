#!/usr/bin/env bash
set -uo pipefail

source "$(dirname "$0")/stub.sh"

passed=0
failed=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    echo "  PASS: $name"
    ((passed++))
  else
    echo "  FAIL: $name — expected '$expected', got '$actual'"
    ((failed++))
  fi
}

echo "=== process-management ==="

# run_parallel — success case
result=$(run_parallel "true" "true" "true")
check "run_parallel all succeed" "all done" "$result"

# run_parallel — failure case
result=$(run_parallel "true" "false" "false" 2>/dev/null || true)
check "run_parallel 2 failed" "2 failed" "$result"

# run_parallel — single success
result=$(run_parallel "exit 0")
check "run_parallel single success" "all done" "$result"

# with_timeout — fast command finishes in time
check "with_timeout fast cmd" "ok" "$(with_timeout 5 "true")"

# with_timeout — slow command exceeds timeout
check "with_timeout slow cmd" "timeout" "$(with_timeout 1 "sleep 10")"

# install_trap — trap fires on exit
check "install_trap output" "cleanup ran" "$(install_trap)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
