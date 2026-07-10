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

echo "Running iam-roles-sts tests against stub.sh..."

check "trust policy allows lambda.amazonaws.com"   grep -qE 'lambda\.amazonaws\.com'          "$STUB"
check "trust policy action is sts:AssumeRole"      grep -qE 'sts:AssumeRole'                  "$STUB"
check "creates role lambda-exec-role"              grep -qE 'iam create-role'                  "$STUB"
check "role-name lambda-exec-role"                 grep -qE -- '--role-name lambda-exec-role'  "$STUB"
check "assume-role-policy-document references file" grep -qE -- '--assume-role-policy-document file://' "$STUB"
check "attaches permission policy to role"         grep -qE 'iam attach-role-policy'            "$STUB"
check "attaches AmazonS3ReadOnlyAccess"            grep -qE 'AmazonS3ReadOnlyAccess'            "$STUB"
check "assumes the role via sts"                   grep -qE 'sts assume-role'                   "$STUB"
check "assume-role targets lambda-exec-role arn"   grep -qE 'role/lambda-exec-role'             "$STUB"
check "assume-role has a session name"             grep -qE -- '--role-session-name demo-session' "$STUB"
check "has an answer comment about no long-lived creds" grep -qE '# answer:'                    "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
