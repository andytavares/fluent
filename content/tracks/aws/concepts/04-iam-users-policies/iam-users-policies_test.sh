#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.sh"

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

echo "Running iam-users-policies tests against stub.sh..."

check "creates user deploy-bot"              grep -qE 'iam create-user'                     "$STUB"
check "user-name is deploy-bot"               grep -qE -- '--user-name deploy-bot'           "$STUB"
check "policy JSON has Effect Allow"          grep -qE '"Effect":\s*"Allow"'                  "$STUB"
check "policy JSON grants s3:GetObject"       grep -qE 's3:GetObject'                         "$STUB"
check "policy JSON grants s3:ListBucket"      grep -qE 's3:ListBucket'                        "$STUB"
check "policy JSON scopes to fluent-data"     grep -qE 'arn:aws:s3:::fluent-data'              "$STUB"
check "creates managed policy s3-read-only"   grep -qE 'iam create-policy'                     "$STUB"
check "policy-name s3-read-only"              grep -qE -- '--policy-name s3-read-only'        "$STUB"
check "policy-document references file"       grep -qE -- '--policy-document file://'          "$STUB"
check "attaches policy to user"               grep -qE 'iam attach-user-policy'                "$STUB"
check "attach-user-policy targets deploy-bot" grep -qE -- '--user-name deploy-bot'              "$STUB"
check "attach-user-policy references s3-read-only arn" grep -qE 'policy/s3-read-only'           "$STUB"
check "creates an access key"                 grep -qE 'iam create-access-key'                 "$STUB"
check "has an answer comment about least privilege" grep -qE '# answer:'                       "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
