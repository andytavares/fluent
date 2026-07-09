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

echo "Running named-templates tests against stub.yaml..."

check "define webapp.fullname"          grep -qE '\{\{-?\s*define\s+"webapp\.fullname"\s*-?\}\}' "$STUB"
check "define webapp.labels"            grep -qE '\{\{-?\s*define\s+"webapp\.labels"\s*-?\}\}'   "$STUB"
check "define webapp.selectorLabels"    grep -qE '\{\{-?\s*define\s+"webapp\.selectorLabels"\s*-?\}\}' "$STUB"
check "fullname combines Release.Name and Chart.Name" grep -qE '\.Release\.Name.*\.Chart\.Name|printf.*%s-%s' "$STUB"
check "trunc 63 used in fullname"       grep -q 'trunc 63' "$STUB"
check "trimSuffix used"                 grep -q 'trimSuffix' "$STUB"
check "labels template has all 4 keys"  bash -c "
  grep -qE 'app\.kubernetes\.io/name:\s*\{\{\s*\.Chart\.Name\s*\}\}' '$STUB' &&
  grep -qE 'app\.kubernetes\.io/instance:\s*\{\{\s*\.Release\.Name\s*\}\}' '$STUB' &&
  grep -qE 'app\.kubernetes\.io/version:\s*\{\{\s*\.Chart\.AppVersion\s*\|\s*quote\s*\}\}' '$STUB' &&
  grep -qE 'helm\.sh/chart:\s*\{\{\s*\.Chart\.Name\s*\}\}-\{\{\s*\.Chart\.Version\s*\}\}' '$STUB'
"
check "include fullname for Service name" grep -qE 'name:\s*\{\{\s*include\s+"webapp\.fullname"\s+\.\s*\}\}' "$STUB"
check "include labels with nindent"     grep -qE 'include\s+"webapp\.labels"\s+\.\s*\|\s*nindent' "$STUB"
check "include selectorLabels with nindent" grep -qE 'include\s+"webapp\.selectorLabels"\s+\.\s*\|\s*nindent' "$STUB"
check "kind is Service"                 grep -qE '^kind:\s*Service\s*$' "$STUB"
check "define blocks use -}} to trim leading blank line" bash -c "[[ \$(grep -oE '\{\{-\s*define\s+\"webapp\.[a-zA-Z]+\"\s*-\}\}' '$STUB' | wc -l) -ge 3 ]]"
check "no leftover TODO comments"       bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
