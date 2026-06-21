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

echo "Running built-in-objects tests against stub.yaml..."

check "Release.Name in name"               grep -q '\.Release\.Name' "$STUB"
check "Release.Namespace used"             grep -q '\.Release\.Namespace' "$STUB"
check "Chart.Name label"                   grep -q '\.Chart\.Name' "$STUB"
check "Chart.AppVersion quoted"            grep -q '\.Chart\.AppVersion.*quote\|quote.*\.Chart\.AppVersion' "$STUB"
check "Chart.Version in helm.sh/chart"     grep -q '\.Chart\.Version' "$STUB"
check "Template.Name annotation"           grep -q '\.Template\.Name' "$STUB"
check "Release.IsInstall conditional"      grep -q '\.Release\.IsInstall' "$STUB"
check "install and upgrade values"         grep -q '"install"' "$STUB" && grep -q '"upgrade"' "$STUB"
check "Capabilities.KubeVersion"           grep -q '\.Capabilities\.KubeVersion' "$STUB"
check "kind is ConfigMap"                  grep -q 'kind: ConfigMap' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
