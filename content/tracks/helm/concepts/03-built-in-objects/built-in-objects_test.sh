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

echo "Running built-in-objects tests against stub.yaml..."

check "kind is ConfigMap"                  grep -qE '^kind:\s*ConfigMap\s*$' "$STUB"
check "name uses Release.Name"             grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-config' "$STUB"
check "namespace uses Release.Namespace"   grep -qE 'namespace:\s*\{\{\s*\.Release\.Namespace\s*\}\}' "$STUB"
check "app.kubernetes.io/name label"       grep -qE 'app\.kubernetes\.io/name:\s*\{\{\s*\.Chart\.Name\s*\}\}' "$STUB"
check "app.kubernetes.io/version quoted"   grep -qE 'app\.kubernetes\.io/version:\s*\{\{\s*\.Chart\.AppVersion\s*\|\s*quote\s*\}\}' "$STUB"
check "helm.sh/chart label"                grep -qE 'helm\.sh/chart:\s*\{\{\s*\.Chart\.Name\s*\}\}-\{\{\s*\.Chart\.Version\s*\}\}' "$STUB"
check "Template.Name annotation"           grep -qE 'meta\.helm\.sh/template:\s*\{\{\s*\.Template\.Name\s*\}\}' "$STUB"
check "install_mode conditional on IsInstall" grep -qE 'install_mode:.*\.Release\.IsInstall' "$STUB"
check "install_mode covers both branches"  bash -c "grep -q '\"install\"' '$STUB' && grep -q '\"upgrade\"' '$STUB'"
check "kube_version from Capabilities"     grep -qE 'kube_version:\s*\{\{\s*\.Capabilities\.KubeVersion\.GitVersion\s*\}\}' "$STUB"

# Built-in objects use capitalized field access (a common typo target)
check "no lowercase .release. typo"        bash -c "! grep -qE '\.release\.' '$STUB'"
check "no lowercase .chart. typo"          bash -c "! grep -qE '\.chart\.' '$STUB'"
check "no leftover TODO comments"          bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
