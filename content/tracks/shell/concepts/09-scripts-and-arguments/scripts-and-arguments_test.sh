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

check_exit() {
  local name="$1" expected_code="$2"
  shift 2
  local actual_code=0
  "$@" > /dev/null 2>&1 || actual_code=$?
  if [[ "$expected_code" == "$actual_code" ]]; then
    echo "  PASS: $name"
    ((passed++))
  else
    echo "  FAIL: $name — expected exit $expected_code, got $actual_code"
    ((failed++))
  fi
}

echo "=== scripts-and-arguments ==="

check "parse_args basic input" \
  "verbose=false output= input=myfile" \
  "$(parse_args myfile)"

check "parse_args verbose flag" \
  "verbose=true output= input=data.txt" \
  "$(parse_args -v data.txt)"

check "parse_args output flag" \
  "verbose=false output=out.txt input=src.txt" \
  "$(parse_args -o out.txt src.txt)"

check "parse_args both flags" \
  "verbose=true output=report.csv input=raw.csv" \
  "$(parse_args -v -o report.csv raw.csv)"

# Missing input should return exit code 1 and write to stderr
parse_args_stderr=$(parse_args 2>&1 || true)
check "parse_args missing input stderr" \
  "error: missing input" \
  "$parse_args_stderr"

check_exit "parse_args missing input exit 1" 1 parse_args

check "safe_divide basic"    "5"  "$(safe_divide 10 2)"
check "safe_divide floor"    "3"  "$(safe_divide 7 2)"
check "safe_divide negative" "-2" "$(safe_divide -6 3)"

div_zero_stderr=$(safe_divide 5 0 2>&1 || true)
check "safe_divide by zero stderr" \
  "error: division by zero" \
  "$div_zero_stderr"
check_exit "safe_divide by zero exit 1" 1 safe_divide 5 0

check "with_tempfile output" \
  "hello from tempfile" \
  "$(with_tempfile)"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
