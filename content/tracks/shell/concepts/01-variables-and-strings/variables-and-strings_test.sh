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

echo "=== variables-and-strings ==="

check "greet basic"          "Hello, Alice!"      "$(greet "Alice")"
check "greet with space"     "Hello, Bob Smith!"  "$(greet "Bob Smith")"
check "greet empty name"     "Hello, !"           "$(greet "")"

check "describe_file txt"    "File: report.txt (ext: txt)"   "$(describe_file "/tmp/report.txt")"
check "describe_file sh"     "File: deploy.sh (ext: sh)"     "$(describe_file "/home/user/scripts/deploy.sh")"
check "describe_file nested" "File: archive.tar.gz (ext: gz)" "$(describe_file "/var/backup/archive.tar.gz")"

check "repeat_word 3 times"  "hi hi hi"    "$(repeat_word "hi" 3)"
check "repeat_word 1 time"   "go"          "$(repeat_word "go" 1)"
check "repeat_word 0 times"  ""            "$(repeat_word "go" 0)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
