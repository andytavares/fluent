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
check "variable subnet_names declared"      grep -q 'variable "subnet_names"' "$FILE"
check "subnet_names type set(string)"       grep -q 'set(string)' "$FILE"
check "subnet_names default includes public" grep -q '"public"' "$FILE"
check "variable environments declared"      grep -q 'variable "environments"' "$FILE"
check "environments type map(string)"       grep -q 'map(string)' "$FILE"
check "environments has staging"            grep -q 'staging' "$FILE"
check "environments has production"         grep -q 'production' "$FILE"
check "t3.micro in environments"            grep -q '"t3.micro"' "$FILE"
check "t3.large in environments"            grep -q '"t3.large"' "$FILE"

# aws_subnet for_each
check "aws_subnet app declared"             grep -q 'resource "aws_subnet" "app"' "$FILE"
check "subnet uses for_each"                grep -q 'for_each.*=.*var\.subnet_names\|for_each.*=.*var\.subnet_names' "$FILE"
check "subnet uses each.key for Name"       grep -q 'each\.key' "$FILE"

# aws_instance for_each
check "aws_instance env declared"           grep -q 'resource "aws_instance" "env"' "$FILE"
check "instance uses for_each environments" grep -q 'for_each.*=.*var\.environments' "$FILE"
check "instance uses each.value"            grep -q 'each\.value' "$FILE"
check "instance uses each.key"              grep -q 'each\.key' "$FILE"

# aws_eip count
check "aws_eip nat declared"                grep -q 'resource "aws_eip" "nat"' "$FILE"
check "eip count = 2"                       grep -q 'count.*=.*2' "$FILE"
check "eip uses count.index"                grep -q 'count\.index' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
