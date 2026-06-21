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

echo "=== arrays ==="

check "array_sum 1..5"     "15"  "$(array_sum 1 2 3 4 5)"
check "array_sum single"   "7"   "$(array_sum 7)"
check "array_sum empty"    "0"   "$(array_sum)"
check "array_sum negative" "0"   "$(array_sum -5 3 2)"

check "unique_sorted basic" \
  "$(printf 'apple\nbanana\ncherry')" \
  "$(unique_sorted banana apple apple cherry banana)"

check "unique_sorted all_same" \
  "x" \
  "$(unique_sorted x x x)"

check "unique_sorted single" \
  "only" \
  "$(unique_sorted only)"

check "invert_map basic" \
  "$(printf '1=a\n2=b\n3=c')" \
  "$(invert_map a=1 b=2 c=3)"

check "invert_map single" \
  "hello=key" \
  "$(invert_map key=hello)"

check "invert_map value with equals" \
  "b=c=a" \
  "$(invert_map a=b=c)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
