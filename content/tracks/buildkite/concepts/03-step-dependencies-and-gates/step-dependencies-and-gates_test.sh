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

echo "Running step-dependencies-and-gates tests against stub.yaml..."

check "lint key present"                  grep -qE 'key:\s*"lint"'                    "$STUB"
check "lint command present"              grep -qE 'command:\s*"make lint"'            "$STUB"

check "unit-tests key present"            grep -qE 'key:\s*"unit-tests"'               "$STUB"
check "unit-tests command present"        grep -qE 'command:\s*"make test-unit"'       "$STUB"
check "unit-tests depends_on lint"        grep -qE 'depends_on:\s*"lint"'               "$STUB"

check "integration-tests key present"     grep -qE 'key:\s*"integration-tests"'        "$STUB"
check "integration-tests command present" grep -qE 'command:\s*"make test-integration"' "$STUB"

check "depends_on lint appears twice"     bash -c "[[ \$(grep -c 'depends_on:\s*\"lint\"' '$STUB') -eq 2 ]]"

check "block step present"                grep -qE '^\s*-\s*block:\s*":rocket: Deploy to production\?"' "$STUB"
check "deploy-gate key present"           grep -qE 'key:\s*"deploy-gate"'               "$STUB"
check "deploy-gate blocked_state failed"  grep -qE 'blocked_state:\s*"failed"'          "$STUB"
check "deploy-gate depends_on unit-tests" grep -qE '^\s*-\s*"unit-tests"\s*$'           "$STUB"
check "deploy-gate depends_on integration-tests" grep -qE '^\s*-\s*"integration-tests"\s*$' "$STUB"

check "deploy key present"                grep -qE 'key:\s*"deploy"'                    "$STUB"
check "deploy command present"            grep -qE 'command:\s*"make deploy"'           "$STUB"
check "deploy depends_on deploy-gate"      grep -qE 'depends_on:\s*"deploy-gate"'        "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
