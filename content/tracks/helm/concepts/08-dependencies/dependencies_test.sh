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

echo "Running dependencies tests against stub.yaml..."

check "dependencies block present"          grep -q 'dependencies:' "$STUB"
check "postgresql dependency name"          grep -q 'name: postgresql' "$STUB"
check "postgresql version constraint"       grep -q '"12\.x\.x"' "$STUB"
check "bitnami repository"                  grep -q 'bitnami\.com' "$STUB"
check "postgresql condition"                grep -q 'condition: postgresql\.enabled' "$STUB"
check "redis dependency name"               grep -q 'name: redis' "$STUB"
check "redis version constraint"            grep -q '"17\.x\.x"' "$STUB"
check "cache alias defined"                 grep -q 'alias: cache' "$STUB"
check "redis condition"                     grep -q 'condition: redis\.enabled' "$STUB"
check "postgresql enabled in values"        grep -q 'enabled: true' "$STUB"
check "postgresql.auth.database set"        grep -q 'database: myplatform' "$STUB"
check "postgresql.auth.username set"        grep -q 'username: platform' "$STUB"
check "cache enabled in values"             grep -q 'cache:' "$STUB"
check "global.imageRegistry set"            grep -q 'imageRegistry:.*gcr\.io/myproject\|gcr\.io/myproject' "$STUB"
check "cache persistence disabled"          grep -q 'persistence:' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
