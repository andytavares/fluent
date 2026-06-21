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

# data aws_vpc
check "data aws_vpc main declared"         grep -q 'data "aws_vpc" "main"' "$FILE"
check "vpc filter by tag Name"             grep -q 'tag:Name' "$FILE"
check "vpc filter value production-vpc"    grep -q '"production-vpc"' "$FILE"

# data aws_ami
check "data aws_ami ubuntu declared"       grep -q 'data "aws_ami" "ubuntu"' "$FILE"
check "ami most_recent true"               grep -q 'most_recent.*=.*true' "$FILE"
check "ami owner Canonical"                grep -q '"099720109477"' "$FILE"
check "ami name filter present"            grep -q 'ubuntu/images/hvm-ssd' "$FILE"

# aws_instance
check "aws_instance web declared"          grep -q 'resource "aws_instance" "web"' "$FILE"
check "instance ami from data source"      grep -q 'data\.aws_ami\.ubuntu\.id' "$FILE"
check "instance_type t3.micro"             grep -q '"t3.micro"' "$FILE"
check "instance references vpc data"       grep -q 'data\.aws_vpc\.main\.id' "$FILE"

# output
check "output vpc_id declared"             grep -q 'output "vpc_id"' "$FILE"
check "output value is data vpc id"        grep -q 'data\.aws_vpc\.main\.id' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
