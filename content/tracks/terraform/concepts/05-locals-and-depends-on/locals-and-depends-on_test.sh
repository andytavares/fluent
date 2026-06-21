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
check "variable project declared"           grep -q 'variable "project"' "$FILE"
check "variable environment declared"       grep -q 'variable "environment"' "$FILE"

# locals
check "locals block present"                grep -q '^locals {' "$FILE"
check "name_prefix uses interpolation"      grep -q 'name_prefix' "$FILE"
check "name_prefix references var.project"  grep -q 'var\.project' "$FILE"
check "name_prefix references var.env"      grep -q 'var\.environment' "$FILE"
check "is_prod conditional expression"      grep -q 'is_prod' "$FILE"
check "is_prod checks == production"        grep -q '"production"' "$FILE"
check "common_tags map defined"             grep -q 'common_tags' "$FILE"
check "common_tags has Project key"         grep -q 'Project' "$FILE"
check "common_tags has Environment key"     grep -q 'Environment' "$FILE"

# resources
check "aws_iam_role app declared"           grep -q 'resource "aws_iam_role" "app"' "$FILE"
check "iam role uses local.name_prefix"     grep -q 'local\.name_prefix' "$FILE"
check "iam role uses local.common_tags"     grep -q 'local\.common_tags' "$FILE"
check "policy attachment declared"          grep -q 'resource "aws_iam_role_policy_attachment" "app_basic"' "$FILE"
check "attachment references role name"     grep -q 'aws_iam_role\.app\.name' "$FILE"
check "lambda function declared"            grep -q 'resource "aws_lambda_function" "app"' "$FILE"
check "lambda role references iam arn"      grep -q 'aws_iam_role\.app\.arn' "$FILE"
check "lambda has depends_on"               grep -q 'depends_on' "$FILE"
check "depends_on references attachment"    grep -q 'aws_iam_role_policy_attachment\.app_basic' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
