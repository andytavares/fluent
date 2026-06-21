#!/usr/bin/env bash
set -euo pipefail

STUB="$(dirname "$0")/stub.yaml"

passed=0
failed=0

check() {
  local name="$1"; shift
  if "$@" &>/dev/null; then
    echo "  PASS: $name"
    ((passed++)) || true
  else
    echo "  FAIL: $name"
    ((failed++)) || true
  fi
}

echo "Running chart-tests tests against stub.yaml..."

check "kind is Pod"                          grep -q 'kind: Pod' "$STUB"
check "helm.sh/hook: test annotation"        grep -q '"helm\.sh/hook": test' "$STUB"
check "hook-delete-policy annotation"        grep -q '"helm\.sh/hook-delete-policy"' "$STUB"
check "before-hook-creation policy"          grep -q 'before-hook-creation' "$STUB"
check "restartPolicy Never"                  grep -q 'restartPolicy: Never' "$STUB"
check "curl image used"                      grep -q 'curlimages/curl' "$STUB"
check "webapp.fullname include"              grep -q 'include "webapp\.fullname"' "$STUB"
check "service.port in curl command"         grep -q '\.Values\.service\.port' "$STUB"
check "/health path"                         grep -q '/health' "$STUB"
check "test-db pod defined"                  grep -q 'test-db' "$STUB"
check "hook-weight on db test"               grep -q '"helm\.sh/hook-weight"' "$STUB"
check "postgres image used"                  grep -q 'postgres:15-alpine' "$STUB"
check "postgresql.auth.username referenced"  grep -q '\.Values\.postgresql\.auth\.username' "$STUB"
check "PGPASSWORD env var"                   grep -q 'PGPASSWORD' "$STUB"
check "secretKeyRef for password"            grep -q 'secretKeyRef' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
