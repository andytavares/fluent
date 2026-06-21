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

# aws_instance web
check "aws_instance web declared"           grep -q 'resource "aws_instance" "web"' "$FILE"
check "web instance_type t3.micro"          grep -q '"t3.micro"' "$FILE"
check "web Name tag web-server"             grep -q '"web-server"' "$FILE"

# aws_instance app
check "aws_instance app declared"           grep -q 'resource "aws_instance" "app"' "$FILE"
check "app instance_type t3.small"          grep -q '"t3.small"' "$FILE"
check "app Name tag app-server"             grep -q '"app-server"' "$FILE"

# import block
check "import block present"                grep -q '^import {' "$FILE"
check "import to aws_instance.web"          grep -q 'to.*=.*aws_instance\.web' "$FILE"
check "import id i-0abc123def456"           grep -q '"i-0abc123def456"' "$FILE"

# outputs
check "output web_instance_id declared"     grep -q 'output "web_instance_id"' "$FILE"
check "web_instance_id value correct"       grep -q 'aws_instance\.web\.id' "$FILE"
check "output app_instance_id declared"     grep -q 'output "app_instance_id"' "$FILE"
check "app_instance_id value correct"       grep -q 'aws_instance\.app\.id' "$FILE"

echo "---"
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
