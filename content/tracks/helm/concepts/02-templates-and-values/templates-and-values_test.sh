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

echo "Running templates-and-values tests against stub.yaml..."

check "Release.Name in metadata.name"       grep -q '\.Release\.Name.*webapp\|webapp.*\.Release\.Name' "$STUB"
check "Chart.Name label present"            grep -q '\.Chart\.Name'           "$STUB"
check "Release.Name label present"          grep -q '\.Release\.Name'         "$STUB"
check "replicaCount with default"           grep -q '\.Values\.replicaCount.*default\|default.*\.Values\.replicaCount' "$STUB"
check "image repository reference"         grep -q '\.Values\.image\.repository' "$STUB"
check "image tag with default latest"       grep -q '\.Values\.image\.tag.*default.*latest' "$STUB"
check "imagePullPolicy with default"        grep -q '\.Values\.image\.pullPolicy.*default' "$STUB"
check "containerPort with default"          grep -q '\.Values\.service\.port.*default\|default.*80' "$STUB"
check "pipeline operator used"              grep -q '|' "$STUB"
check "kind is Deployment"                  grep -q 'kind: Deployment'        "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
