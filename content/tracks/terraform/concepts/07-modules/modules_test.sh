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
check "variable environment declared"         grep -q 'variable "environment"' "$FILE"
check "variable project declared"             grep -q 'variable "project"' "$FILE"

# local module
check "module network declared"               grep -q 'module "network"' "$FILE"
check "network source local path"             grep -q '"./modules/vpc"' "$FILE"
check "network cidr_block 10.0.0.0/16"        grep -q '"10.0.0.0/16"' "$FILE"
check "network environment from var"          grep -q 'environment.*=.*var\.environment' "$FILE"
check "network project from var"              grep -q 'project.*=.*var\.project' "$FILE"

# registry module
check "module managed_vpc declared"           grep -q 'module "managed_vpc"' "$FILE"
check "managed_vpc registry source"           grep -q '"terraform-aws-modules/vpc/aws"' "$FILE"
check "managed_vpc version pinned"            grep -q 'version.*=.*"~> 5.0"' "$FILE"
check "managed_vpc cidr 10.1.0.0/16"          grep -q '"10.1.0.0/16"' "$FILE"

# outputs
check "output vpc_id declared"                grep -q 'output "vpc_id"' "$FILE"
check "vpc_id value from module.network"      grep -q 'module\.network\.vpc_id' "$FILE"
check "output managed_vpc_id declared"        grep -q 'output "managed_vpc_id"' "$FILE"
check "managed_vpc_id from module"            grep -q 'module\.managed_vpc\.vpc_id' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
