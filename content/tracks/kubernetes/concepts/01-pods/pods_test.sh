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

echo "Running pods tests against stub.yaml..."

check "apiVersion is v1"           grep -qE '^apiVersion:\s*v1\s*$'              "$STUB"
check "kind is Pod"                 grep -qE '^kind:\s*Pod\s*$'                   "$STUB"
check "metadata.name is web"        grep -qE '^\s*name:\s*web\s*$'                "$STUB"
check "labels app: web present"     grep -qE '^\s*app:\s*web\s*$'                 "$STUB"
check "containers key present"      grep -qE '^\s*containers:\s*$'                "$STUB"
check "container named web"         grep -qE '^\s*-\s*name:\s*web\s*$'            "$STUB"
check "image is nginx:1.25"         grep -qE '^\s*image:\s*nginx:1\.25\s*$'       "$STUB"
check "containerPort is 8080"       grep -qE '^\s*-?\s*containerPort:\s*8080\s*$' "$STUB"
check "env key present"             grep -qE '^\s*env:\s*$'                       "$STUB"
check "env name is APP_ENV"         grep -qE '^\s*-?\s*name:\s*APP_ENV\s*$'       "$STUB"
check "env value is production"     grep -qE '^\s*value:\s*"?production"?\s*$'   "$STUB"
check "restartPolicy is Always"     grep -qE '^\s*restartPolicy:\s*Always\s*$'    "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
