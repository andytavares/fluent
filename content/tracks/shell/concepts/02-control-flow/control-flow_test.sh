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

echo "=== control-flow ==="

check "classify positive"   "positive"  "$(classify_number 42)"
check "classify negative"   "negative"  "$(classify_number -7)"
check "classify zero"       "zero"      "$(classify_number 0)"
check "classify large neg"  "negative"  "$(classify_number -1000)"

# file_status tests using real filesystem
tmpdir=$(mktemp -d)
tmpfile="${tmpdir}/nonempty.txt"
echo "some content" > "$tmpfile"
emptyfile="${tmpdir}/empty.txt"
touch "$emptyfile"

check "file_status directory"   "directory"   "$(file_status "$tmpdir")"
check "file_status file"        "file"        "$(file_status "$tmpfile")"
check "file_status empty-file"  "empty-file"  "$(file_status "$emptyfile")"
check "file_status missing"     "missing"     "$(file_status "${tmpdir}/nonexistent")"

rm -rf "$tmpdir"

check "day_type Saturday"  "weekend"  "$(day_type "Saturday")"
check "day_type Sunday"    "weekend"  "$(day_type "Sunday")"
check "day_type Monday"    "weekday"  "$(day_type "Monday")"
check "day_type Friday"    "weekday"  "$(day_type "Friday")"
check "day_type Wednesday" "weekday"  "$(day_type "Wednesday")"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
