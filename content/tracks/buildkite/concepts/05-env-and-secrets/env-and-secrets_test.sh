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

echo "Running env-and-secrets tests against stub.yaml..."

check "top-level env block present"      grep -qE '^env:\s*$'                        "$STUB"
check "pipeline NODE_ENV is test"        grep -qE 'NODE_ENV:\s*"test"'                "$STUB"
check "pipeline APP_NAME is webapp"      grep -qE 'APP_NAME:\s*"webapp"'              "$STUB"

check "build key present"                grep -qE 'key:\s*"build"'                    "$STUB"
check "build command present"            grep -qE 'command:\s*"make build"'           "$STUB"
check "build overrides NODE_ENV production" grep -qE 'NODE_ENV:\s*"production"'       "$STUB"

check "deploy key present"               grep -qE 'key:\s*"deploy"'                   "$STUB"
check "deploy command present"           grep -qE 'command:\s*"make deploy"'          "$STUB"
check "deploy depends_on build"          grep -qE 'depends_on:\s*"build"'             "$STUB"
check "deploy has secrets list"          grep -qE '^\s*secrets:\s*$'                  "$STUB"
check "secrets reference API_ACCESS_TOKEN" grep -qE '^\s*-\s*API_ACCESS_TOKEN\s*$'    "$STUB"

check "no hardcoded secret literal value" bash -c "! grep -qE 'API_ACCESS_TOKEN:\s*\"' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
