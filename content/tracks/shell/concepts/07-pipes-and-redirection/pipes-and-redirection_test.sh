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

echo "=== pipes-and-redirection ==="

# count_matching
tmpfile=$(mktemp)
printf "error: disk full\ninfo: ok\nerror: timeout\nwarn: slow\n" > "$tmpfile"
check "count_matching 2 errors"  "2"  "$(count_matching "error" "$tmpfile")"
check "count_matching 1 info"    "1"  "$(count_matching "info" "$tmpfile")"
check "count_matching 0 missing" "0"  "$(count_matching "fatal" "$tmpfile")"
rm -f "$tmpfile"

# merge_streams
merged=$(merge_streams "echo stdout_line; echo stderr_line >&2")
check "merge_streams has stdout" "1" "$(echo "$merged" | grep -c "stdout_line")"
check "merge_streams has stderr" "1" "$(echo "$merged" | grep -c "stderr_line")"

# top_n_words
top_output=$(echo "the cat sat on the mat the cat" | top_n_words 2)
top_line1=$(echo "$top_output" | sed -n '1p')
top_line2=$(echo "$top_output" | sed -n '2p')

# "the" appears 3 times, "cat" appears 2 times
check "top_n_words first word count"  "3"   "$(echo "$top_line1" | awk '{print $1}')"
check "top_n_words first word"        "the" "$(echo "$top_line1" | awk '{print $2}')"
check "top_n_words second word count" "2"   "$(echo "$top_line2" | awk '{print $1}')"
check "top_n_words second word"       "cat" "$(echo "$top_line2" | awk '{print $2}')"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
