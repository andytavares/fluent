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

echo "Running functions-and-pipelines tests against stub.yaml..."

check "printf for name construction"    grep -q 'printf' "$STUB"
check "trunc 63 used"                   grep -q 'trunc 63' "$STUB"
check "trimSuffix used"                 grep -q 'trimSuffix' "$STUB"
check "Release.Namespace for namespace" grep -q '\.Release\.Namespace' "$STUB"
check "default for global.env"          grep -q 'default.*production\|production.*default' "$STUB"
check "lower function used"             grep -q '| lower' "$STUB"
check "required for db.host"            grep -q 'required.*db\.host\|db\.host.*required' "$STUB"
check "required for db.password"        grep -q 'required.*db\.password\|db\.password.*required' "$STUB"
check "b64enc used"                     grep -q 'b64enc' "$STUB"
check "default for db.name"             grep -q 'default.*appdb\|appdb.*default' "$STUB"
check "quote used"                      grep -q '| quote' "$STUB"
check "pipeline operator used"          grep -q '|' "$STUB"
check "kind is Secret"                  grep -q 'kind: Secret' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
