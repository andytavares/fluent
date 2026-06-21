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

echo "=== text-processing ==="

# extract_emails
check "extract single email" \
  "user@example.com" \
  "$(echo "contact user@example.com" | extract_emails)"

check "extract multiple emails" \
  "$(printf 'a@b.com\nx@y.org')" \
  "$(echo "send to a@b.com and x@y.org today" | extract_emails)"

check "extract no emails" \
  "" \
  "$(echo "no addresses here" | extract_emails)"

# remove_comments
check "remove leading hash" \
  "$(printf 'real line\nanother')" \
  "$(printf '# comment\nreal line\n# skip\nanother\n' | remove_comments)"

check "remove indented hash" \
  "code here" \
  "$(printf '  # indented\ncode here\n' | remove_comments)"

check "keep non-comment lines" \
  "$(printf 'a\nb\nc')" \
  "$(printf 'a\nb\nc\n' | remove_comments)"

# sum_second_column
check "sum column 2 basic" \
  "60" \
  "$(printf 'x 10\ny 20\nz 30\n' | sum_second_column)"

check "sum column 2 single row" \
  "42" \
  "$(printf 'item 42\n' | sum_second_column)"

check "sum column 2 empty" \
  "0" \
  "$(printf '' | sum_second_column)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
