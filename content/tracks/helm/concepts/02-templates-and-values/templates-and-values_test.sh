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

echo "Running templates-and-values tests against stub.yaml..."

check "kind is Deployment"                  grep -qE '^kind:\s*Deployment\s*$' "$STUB"
check "metadata.name uses Release.Name"     grep -qE 'name:\s*\{\{\s*\.Release\.Name\s*\}\}-webapp' "$STUB"
check "Chart.Name label present"            grep -qE 'app\.kubernetes\.io/name:\s*\{\{\s*\.Chart\.Name\s*\}\}' "$STUB"
check "Release.Name instance label present" grep -qE 'app\.kubernetes\.io/instance:\s*\{\{\s*\.Release\.Name\s*\}\}' "$STUB"
check "replicas from replicaCount, default 1" grep -qE 'replicas:\s*\{\{\s*\.Values\.replicaCount\s*\|\s*default\s+1\s*\}\}' "$STUB"
check "image built from repository:tag"     grep -qE 'image:\s*\{\{\s*\.Values\.image\.repository\s*\}\}:\{\{\s*\.Values\.image\.tag' "$STUB"
check "image tag defaults to latest"        grep -qE '\.Values\.image\.tag\s*\|\s*default\s+"latest"' "$STUB"
check "imagePullPolicy with default IfNotPresent" grep -qE 'imagePullPolicy:\s*\{\{\s*\.Values\.image\.pullPolicy\s*\|\s*default\s+"IfNotPresent"\s*\}\}' "$STUB"
check "containerPort with default 80"       grep -qE 'containerPort:\s*\{\{\s*\.Values\.service\.port\s*\|\s*default\s+80\s*\}\}' "$STUB"
check "at least one pipeline operator used" grep -q '|' "$STUB"

# No leftover TODO markers
check "no leftover TODO comments"           bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
