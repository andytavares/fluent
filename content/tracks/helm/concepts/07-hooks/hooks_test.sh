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

echo "Running hooks tests against stub.yaml..."

check "kind is Job"                         grep -q 'kind: Job' "$STUB"
check "Release.Name in job name"            grep -q '\.Release\.Name' "$STUB"
check "db-migrate in name"                  grep -q 'db-migrate' "$STUB"
check "helm.sh/hook annotation"             grep -q '"helm\.sh/hook"' "$STUB"
check "pre-install phase"                   grep -q 'pre-install' "$STUB"
check "pre-upgrade phase"                   grep -q 'pre-upgrade' "$STUB"
check "hook-weight annotation"              grep -q '"helm\.sh/hook-weight"' "$STUB"
check "weight is -5"                        grep -q '"-5"' "$STUB"
check "hook-delete-policy annotation"       grep -q '"helm\.sh/hook-delete-policy"' "$STUB"
check "before-hook-creation policy"         grep -q 'before-hook-creation' "$STUB"
check "hook-succeeded policy"               grep -q 'hook-succeeded' "$STUB"
check "backoffLimit 0"                      grep -q 'backoffLimit: 0' "$STUB"
check "activeDeadlineSeconds 120"           grep -q 'activeDeadlineSeconds: 120' "$STUB"
check "restartPolicy Never"                 grep -q 'restartPolicy: Never' "$STUB"
check "migrations.image referenced"         grep -q '\.Values\.migrations\.image' "$STUB"
check "migrations.enabled guard"            grep -q '\.Values\.migrations\.enabled' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
