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

echo "Running control-flow tests against stub.yaml..."

check "uses if for pullPolicy"                grep -q '{{-\? if .*pullPolicy\|{{-\? if.*image\.pullPolicy' "$STUB"
check "has else branch"                      grep -q '{{-\? else' "$STUB"
check "has end tags"                         grep -q '{{-\? end' "$STUB"
check "range over .Values.env"               grep -q 'range \.Values\.env' "$STUB"
check ".name inside range"                   grep -q '\.name' "$STUB"
check ".value inside range"                  grep -q '\.value' "$STUB"
check "with for resources"                   grep -q 'with \.Values\.resources' "$STUB"
check "if for livenessProbe.enabled"         grep -q '\.livenessProbe\.enabled' "$STUB"
check "livenessProbe.path referenced"        grep -q '\.livenessProbe\.path' "$STUB"
check "whitespace control used ({{-)"        grep -q '{{-' "$STUB"
check "if guard around env block"            grep -q '\.Values\.env' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
