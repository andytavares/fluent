#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-exemplar.tf}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$SCRIPT_DIR/$TARGET"

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

echo "Testing $TARGET"
echo "---"

# variables
check "variable environment declared"     grep -q 'variable "environment"' "$FILE"
check "environment default staging"       grep -q '"staging"' "$FILE"
check "variable project declared"         grep -q 'variable "project"' "$FILE"
check "project default myapp"             grep -q '"myapp"' "$FILE"
check "variable region declared"          grep -q 'variable "region"' "$FILE"

# locals block
check "locals block present"              grep -q '^locals {' "$FILE"
check "bucket_name uses interpolation"    grep -q 'var\.project' "$FILE"
check "bucket_name uses environment"      grep -q 'var\.environment' "$FILE"
check "string interpolation syntax"       grep -q '\${' "$FILE"
check "conditional expression present"    grep -q '? "t3.large"' "$FILE"
check "conditional else t3.micro"         grep -q '"t3.micro"' "$FILE"
check "merge() function used"             grep -q 'merge(' "$FILE"
check "toset() function used"             grep -q 'toset(' "$FILE"
check "toset deduplication list"          grep -q 'us-east-1a.*us-east-1b.*us-east-1a\|us-east-1a".*"us-east-1b".*"us-east-1a' "$FILE"

# outputs
check "output bucket_name declared"       grep -q 'output "bucket_name"' "$FILE"
check "bucket_name value local"           grep -q 'local\.bucket_name' "$FILE"
check "output instance_type declared"     grep -q 'output "instance_type"' "$FILE"
check "instance_type value local"         grep -q 'local\.instance_type' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
