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

echo "Running hooks tests against stub.yaml..."

check "whole template guarded by migrations.enabled" grep -qE '\{\{-?\s*if\s+\.Values\.migrations\.enabled\s*\}\}' "$STUB"
check "guard has matching end"                 grep -qE '\{\{-?\s*end\s*-?\}\}' "$STUB"
check "kind is Job"                            grep -qE '^kind:\s*Job\s*$' "$STUB"
check "name uses Release.Name + db-migrate"    grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-db-migrate' "$STUB"
check "hook annotations are under 'annotations:' key" grep -qE '^\s*annotations:\s*$' "$STUB"
check "helm.sh/hook annotation present"        grep -qE '"helm\.sh/hook":\s*pre-install,pre-upgrade' "$STUB"
check "pre-install phase"                      grep -q 'pre-install' "$STUB"
check "pre-upgrade phase"                      grep -q 'pre-upgrade' "$STUB"
check "hook-weight is -5"                      grep -qE '"helm\.sh/hook-weight":\s*"-5"' "$STUB"
check "hook-delete-policy correct"             grep -qE '"helm\.sh/hook-delete-policy":\s*before-hook-creation,hook-succeeded' "$STUB"
check "backoffLimit is 0"                      grep -qE 'backoffLimit:\s*0\s*$' "$STUB"
check "activeDeadlineSeconds is 120"           grep -qE 'activeDeadlineSeconds:\s*120\s*$' "$STUB"
check "restartPolicy Never"                    grep -qE 'restartPolicy:\s*Never\s*$' "$STUB"
check "migrations.image referenced"            grep -qE 'image:\s*\{\{\s*\.Values\.migrations\.image\s*\}\}' "$STUB"
check "migration command"                      grep -qE 'command:\s*\["sh",\s*"-c",\s*"python manage\.py migrate"\]' "$STUB"
check "no leftover TODO comments"               bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
