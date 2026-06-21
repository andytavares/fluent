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

# locals
check "locals block present"                  grep -q '^locals {' "$FILE"
check "environment uses terraform.workspace"  grep -q 'terraform\.workspace' "$FILE"
check "is_prod checks production workspace"   grep -q '"production"' "$FILE"
check "instance_type conditional t3.large"    grep -q '"t3.large"' "$FILE"
check "instance_type conditional t3.micro"    grep -q '"t3.micro"' "$FILE"
check "name_prefix uses terraform.workspace"  bash -c '[[ $(grep -c "terraform\.workspace" "'"$FILE"'") -ge 2 ]]'

# aws_instance
check "aws_instance app declared"             grep -q 'resource "aws_instance" "app"' "$FILE"
check "instance uses local.instance_type"     grep -q 'local\.instance_type' "$FILE"
check "instance Environment tag"              grep -q 'local\.environment' "$FILE"
check "instance Name tag uses name_prefix"    grep -q 'local\.name_prefix' "$FILE"

# aws_s3_bucket
check "aws_s3_bucket state_backup declared"   grep -q 'resource "aws_s3_bucket" "state_backup"' "$FILE"
check "bucket name uses name_prefix"          grep -q 'local\.name_prefix.*state-backup\|state-backup.*local\.name_prefix\|name_prefix.*state-backup' "$FILE"
check "bucket Environment tag"                bash -c '[[ $(grep -c "local\.environment" "'"$FILE"'") -ge 2 ]]'

# outputs
check "output environment declared"           grep -q 'output "environment"' "$FILE"
check "environment value local"               grep -q 'value.*=.*local\.environment' "$FILE"
check "output instance_type declared"         grep -q 'output "instance_type"' "$FILE"
check "instance_type value local"             grep -q 'value.*=.*local\.instance_type' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
