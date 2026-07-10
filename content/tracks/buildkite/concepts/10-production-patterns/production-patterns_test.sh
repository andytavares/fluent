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

echo "Running production-patterns tests against stub.yaml..."

check "build key present"                grep -qE 'key:\s*"build"'                        "$STUB"
check "build timeout 10"                 grep -qE 'timeout_in_minutes:\s*10\s*$'           "$STUB"
check "build retry automatic block"      grep -qE '^\s*automatic:\s*$'                     "$STUB"
check "build retry exit_status wildcard" grep -qE 'exit_status:\s*"\*"'                     "$STUB"
check "build retry limit 2"              grep -qE 'limit:\s*2\s*$'                          "$STUB"

check "integration-tests key present"    grep -qE 'key:\s*"integration-tests"'              "$STUB"
check "integration-tests depends_on build" bash -c "[[ \$(grep -c 'depends_on:\s*\"build\"' '$STUB') -eq 2 ]]"
check "integration-tests timeout 15"     grep -qE 'timeout_in_minutes:\s*15\s*$'            "$STUB"
check "integration-tests soft_fail block" grep -qE '^\s*soft_fail:\s*$'                     "$STUB"
check "integration-tests soft_fail exit_status 1" grep -qE 'exit_status:\s*1\s*$'           "$STUB"

check "deploy key present"               grep -qE 'key:\s*"deploy"'                         "$STUB"
check "deploy concurrency 1"             grep -qE '^\s*concurrency:\s*1\s*$'                "$STUB"
check "deploy concurrency_group"         grep -qE 'concurrency_group:\s*"myapp/deploy"'     "$STUB"
check "deploy timeout 20"                grep -qE 'timeout_in_minutes:\s*20\s*$'            "$STUB"
check "deploy retry manual not allowed"  grep -qE 'allowed:\s*false'                         "$STUB"
check "deploy retry manual reason"       grep -qE 'reason:\s*"'                              "$STUB"

check "trigger step present"             grep -qE '^\s*-\s*trigger:\s*"downstream-smoke-tests"' "$STUB"
check "trigger-smoke key present"        grep -qE 'key:\s*"trigger-smoke"'                  "$STUB"
check "trigger depends_on deploy"        grep -qE 'depends_on:\s*"deploy"'                  "$STUB"
check "trigger build branch main"        grep -qE 'branch:\s*"main"'                        "$STUB"

check "notify block present"             grep -qE '^notify:\s*$'                            "$STUB"
check "notify slack channel #deploys"    grep -qE '#deploys'                                "$STUB"
check "notify conditional on failed"     grep -qE 'if:\s*build\.state == "failed"'           "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
