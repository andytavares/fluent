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

echo "Running secrets-and-config tests against stub.sh..."

check "creates Secrets Manager secret"          grep -qE 'secretsmanager create-secret'           "$STUB"
check "secret name is prod/orders-db/password"  grep -qE -- '--name prod/orders-db/password'       "$STUB"
check "secret string has username/password"     grep -qE '"username":"app_user"'                    "$STUB"
check "retrieves the secret value"              grep -qE 'secretsmanager get-secret-value'          "$STUB"
check "get-secret-value targets the right secret" grep -qE -- '--secret-id prod/orders-db/password' "$STUB"
check "puts an SSM parameter"                   grep -qE 'ssm put-parameter'                         "$STUB"
check "parameter name is /fluent/orders/api-key" grep -qE -- '--name /fluent/orders/api-key'          "$STUB"
check "parameter type is SecureString"          grep -qE -- '--type SecureString'                    "$STUB"
check "retrieves the parameter with decryption" grep -qE -- '--with-decryption'                       "$STUB"
check "IAM policy grants secretsmanager:GetSecretValue" grep -qE 'secretsmanager:GetSecretValue'      "$STUB"
check "IAM policy scopes to the specific secret ARN"    grep -qE 'secret:prod/orders-db/password-\*'  "$STUB"
check "IAM policy is not Resource *"             bash -c '! grep -qE "\"Resource\":\s*\"\\*\"" "'"$STUB"'"'
check "configures secret rotation"              grep -qE 'secretsmanager rotate-secret'               "$STUB"
check "rotation uses a rotation lambda arn"     grep -qE -- '--rotation-lambda-arn'                    "$STUB"
check "rotation rule is AutomaticallyAfterDays 30" grep -qE 'AutomaticallyAfterDays=30'                "$STUB"
check "has an answer comment about the checklist violation" grep -qE '# answer:'                       "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
