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

echo "Running named-templates tests against stub.yaml..."

check "define webapp.fullname"          grep -q 'define "webapp\.fullname"'       "$STUB"
check "define webapp.labels"            grep -q 'define "webapp\.labels"'         "$STUB"
check "define webapp.selectorLabels"    grep -q 'define "webapp\.selectorLabels"' "$STUB"
check "trunc 63 used in fullname"       grep -q 'trunc 63'                        "$STUB"
check "trimSuffix used"                 grep -q 'trimSuffix'                      "$STUB"
check "include fullname for name"       grep -q 'include "webapp\.fullname"'      "$STUB"
check "include labels with nindent"     grep -q 'include "webapp\.labels".*nindent\|nindent.*include "webapp\.labels"' "$STUB"
check "include selectorLabels"          grep -q 'include "webapp\.selectorLabels"' "$STUB"
check "nindent used"                    grep -q 'nindent'                          "$STUB"
check "kind is Service"                 grep -q 'kind: Service'                   "$STUB"
check "app.kubernetes.io/name in labels" grep -q 'app\.kubernetes\.io/name'      "$STUB"
check "app.kubernetes.io/instance"      grep -q 'app\.kubernetes\.io/instance'   "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
