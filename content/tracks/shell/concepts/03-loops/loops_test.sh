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

echo "=== loops ==="

check "sum_range 1 10"   "55"   "$(sum_range 1 10)"
check "sum_range 1 1"    "1"    "$(sum_range 1 1)"
check "sum_range 0 0"    "0"    "$(sum_range 0 0)"
check "sum_range 5 10"   "45"   "$(sum_range 5 10)"

# count_lines — create temp files with known line counts
tmpfile=$(mktemp)
printf "line1\nline2\nline3\n" > "$tmpfile"
check "count_lines 3"    "3"    "$(count_lines "$tmpfile")"

printf "only one\n" > "$tmpfile"
check "count_lines 1"    "1"    "$(count_lines "$tmpfile")"

printf "" > "$tmpfile"
check "count_lines 0"    "0"    "$(count_lines "$tmpfile")"
rm -f "$tmpfile"

# fizzbuzz — check specific lines of the output
fb_output=$(fizzbuzz 15)
check "fizzbuzz 1"   "1"        "$(echo "$fb_output" | sed -n '1p')"
check "fizzbuzz 3"   "Fizz"     "$(echo "$fb_output" | sed -n '3p')"
check "fizzbuzz 5"   "Buzz"     "$(echo "$fb_output" | sed -n '5p')"
check "fizzbuzz 6"   "Fizz"     "$(echo "$fb_output" | sed -n '6p')"
check "fizzbuzz 10"  "Buzz"     "$(echo "$fb_output" | sed -n '10p')"
check "fizzbuzz 15"  "FizzBuzz" "$(echo "$fb_output" | sed -n '15p')"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
