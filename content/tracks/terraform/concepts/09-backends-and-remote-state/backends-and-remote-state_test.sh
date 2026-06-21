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

# backend block
check "terraform block present"               grep -q '^terraform {' "$FILE"
check "backend s3 declared"                   grep -q 'backend "s3"' "$FILE"
check "backend bucket my-tf-state-prod"       grep -q '"my-tf-state-prod"' "$FILE"
check "backend key app/terraform.tfstate"     grep -q '"app/terraform\.tfstate"' "$FILE"
check "backend region us-east-1"              grep -q '"us-east-1"' "$FILE"
check "backend encrypt = true"                grep -q 'encrypt.*=.*true' "$FILE"
check "backend dynamodb_table lock"           grep -q '"terraform-state-lock"' "$FILE"

# remote state data source
check "terraform_remote_state declared"       grep -q 'data "terraform_remote_state" "network"' "$FILE"
check "remote state backend s3"               grep -q 'backend.*=.*"s3"' "$FILE"
check "remote state key network"              grep -q '"network/terraform\.tfstate"' "$FILE"

# aws_instance
check "aws_instance app declared"             grep -q 'resource "aws_instance" "app"' "$FILE"
check "instance subnet from remote state"     grep -q 'data\.terraform_remote_state\.network\.outputs\.public_subnet_id' "$FILE"

# output
check "output instance_id declared"           grep -q 'output "instance_id"' "$FILE"
check "instance_id value correct"             grep -q 'aws_instance\.app\.id' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
