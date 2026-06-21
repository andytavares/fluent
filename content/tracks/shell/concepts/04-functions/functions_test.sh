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

echo "=== functions ==="

check "max a>b"      "9"    "$(max 9 3)"
check "max b>a"      "9"    "$(max 3 9)"
check "max equal"    "5"    "$(max 5 5)"
check "max negative" "0"    "$(max -3 0)"

check "join_by comma"   "a,b,c"     "$(join_by , a b c)"
check "join_by dash"    "x-y-z"     "$(join_by - x y z)"
check "join_by space"   "a b"       "$(join_by ' ' a b)"
check "join_by one arg" "solo"      "$(join_by , solo)"
check "join_by no args" ""          "$(join_by ,)"

# repeat_func — capture output and compare lines
triple_output=$(repeat_func echo 3)
check "repeat_func line 1" "1" "$(echo "$triple_output" | sed -n '1p')"
check "repeat_func line 2" "2" "$(echo "$triple_output" | sed -n '2p')"
check "repeat_func line 3" "3" "$(echo "$triple_output" | sed -n '3p')"
check "repeat_func 0"      ""  "$(repeat_func echo 0)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
