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

# variable "region"
check "variable region declared"         grep -q 'variable "region"' "$FILE"
check "region type string"               grep -q 'type.*=.*string' "$FILE"
check "region default us-east-1"         grep -q '"us-east-1"' "$FILE"
check "region has description"           grep -q 'description' "$FILE"

# variable "instance_type"
check "variable instance_type declared"  grep -q 'variable "instance_type"' "$FILE"
check "instance_type default t3.micro"   grep -q '"t3.micro"' "$FILE"
check "validation block present"         grep -q 'validation {' "$FILE"
check "validation uses contains()"       grep -q 'contains(' "$FILE"
check "validation error_message set"     grep -q 'error_message' "$FILE"

# variable "db_password"
check "variable db_password declared"    grep -q 'variable "db_password"' "$FILE"
check "db_password sensitive = true"     grep -q 'sensitive.*=.*true' "$FILE"

# outputs
check "output region declared"           grep -q 'output "region"' "$FILE"
check "output region value = var.region" grep -q 'var\.region' "$FILE"
check "output instance_type declared"    grep -q 'output "instance_type"' "$FILE"
check "output instance_type has desc"    bash -c '[[ $(grep -c "description" "'"$FILE"'") -ge 2 ]]'

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
