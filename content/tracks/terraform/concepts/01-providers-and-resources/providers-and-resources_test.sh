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

# terraform block
check "terraform block present"          grep -q '^terraform {' "$FILE"
check "required_version set"             grep -q 'required_version' "$FILE"
check "required_version >= 1.5.0"        grep -q '>= 1.5.0' "$FILE"
check "required_providers block present" grep -q 'required_providers' "$FILE"
check "aws provider source declared"     grep -q '"hashicorp/aws"' "$FILE"
check "aws provider version ~> 5.0"      grep -q '"~> 5.0"' "$FILE"

# provider block
check "provider aws block present"       grep -q 'provider "aws"' "$FILE"
check "region us-west-2"                 grep -q '"us-west-2"' "$FILE"

# aws_vpc resource
check "aws_vpc resource declared"        grep -q 'resource "aws_vpc" "main"' "$FILE"
check "vpc cidr_block 10.0.0.0/16"      grep -q '"10.0.0.0/16"' "$FILE"
check "vpc Name tag"                     grep -q '"main-vpc"' "$FILE"
check "vpc Environment tag"              grep -q '"production"' "$FILE"

# aws_subnet resource
check "aws_subnet resource declared"     grep -q 'resource "aws_subnet" "public"' "$FILE"
check "subnet references vpc id"         grep -q 'aws_vpc\.main\.id' "$FILE"
check "subnet cidr_block 10.0.1.0/24"   grep -q '"10.0.1.0/24"' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
