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

echo "Running conditionals tests against stub.yaml..."

check "deploy-staging key present"      grep -qE 'key:\s*"deploy-staging"'                "$STUB"
check "deploy-staging command present"  grep -qE 'command:\s*"make deploy ENV=staging"'    "$STUB"
check "deploy-staging branches main"    grep -qE 'branches:\s*"main"'                       "$STUB"

check "deploy-production key present"   grep -qE 'key:\s*"deploy-production"'               "$STUB"
check "deploy-production command present" grep -qE 'command:\s*"make deploy ENV=production"' "$STUB"
check "deploy-production if tag set"    grep -qE 'if:\s*build\.tag != null'                  "$STUB"

check "extended-tests key present"      grep -qE 'key:\s*"extended-tests"'                   "$STUB"
check "extended-tests command present"  grep -qE 'command:\s*"make test-extended"'           "$STUB"
check "extended-tests if condition"     grep -qE 'build\.pull_request\.id == null && build\.branch == .main.' "$STUB"

check "lint key present"                grep -qE 'key:\s*"lint"'                             "$STUB"
check "lint command present"            grep -qE 'command:\s*"make lint"'                    "$STUB"
check "lint if skip ci"                 grep -qE 'if:\s*build\.message !~ /skip ci/'          "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
