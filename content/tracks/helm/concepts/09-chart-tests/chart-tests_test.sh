#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.yaml"

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

echo "Running chart-tests tests against stub.yaml..."

check "two Pod documents defined"             bash -c "[[ \$(grep -c '^kind: Pod\$' '$STUB') -ge 2 ]]"
check "helm.sh/hook: test annotation (both)"  bash -c "[[ \$(grep -c '\"helm\.sh/hook\": test' '$STUB') -ge 2 ]]"
check "hook-delete-policy annotation"         grep -qE '"helm\.sh/hook-delete-policy":\s*before-hook-creation' "$STUB"
check "restartPolicy Never (both pods)"       bash -c "[[ \$(grep -cE 'restartPolicy:\s*Never\s*$' '$STUB') -ge 2 ]]"

check "test-connection pod name"              grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-test-connection' "$STUB"
check "curl image used"                       grep -q 'curlimages/curl:latest' "$STUB"
check "webapp.fullname include in curl url"   grep -qE 'include\s+"webapp\.fullname"\s+\.' "$STUB"
check "service.port in curl command"          grep -q '.Values.service.port' "$STUB"
check "/health path in curl command"          grep -q '/health' "$STUB"
check "curl --fail flag"                      grep -q -- '--fail' "$STUB"
check "curl --max-time flag (bounded test)"   grep -q -- '--max-time' "$STUB"

check "test-db pod name"                      grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-test-db' "$STUB"
check "hook-weight on db test is 1"           grep -qE '"helm\.sh/hook-weight":\s*"1"' "$STUB"
check "postgres image used"                   grep -q 'postgres:15-alpine' "$STUB"
check "postgresql.auth.username referenced"   grep -q '.Values.postgresql.auth.username' "$STUB"
check "PGPASSWORD env var"                    grep -q 'PGPASSWORD' "$STUB"
check "secretKeyRef for password"             grep -qE 'secretKeyRef:\s*$' "$STUB"
check "secretKeyRef.key is password"          grep -qE 'key:\s*password\s*$' "$STUB"
check "secretKeyRef name uses Release.Name-postgresql" grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-postgresql' "$STUB"

check "no leftover TODO comments"             bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
