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

echo "Running production-patterns tests against stub.yaml..."

check "Release.Name in NOTES"                grep -q '\.Release\.Name' "$STUB"
check "Release.Namespace in NOTES"           grep -q '\.Release\.Namespace' "$STUB"
check "Chart.AppVersion or AppVersion shown" grep -q '\.Chart\.AppVersion\|\.Chart\.Version' "$STUB"
check "LoadBalancer conditional"             grep -q 'eq \.Values\.service\.type.*LoadBalancer\|LoadBalancer' "$STUB"
check "kubectl mentioned"                    grep -q 'kubectl' "$STUB"
check "port-forward in else branch"          grep -q 'port-forward' "$STUB"
check "service.port in port-forward"         grep -q '\.Values\.service\.port' "$STUB"
check "if/else/end control flow"             grep -q '{{-\? if' "$STUB" && grep -q '{{-\? else' "$STUB" && grep -q '{{-\? end' "$STUB"
check "JSON Schema present"                  grep -q 'schema.*json-schema\.org\|json-schema\.org' "$STUB"
check "replicaCount integer validation"      grep -q '"integer"' "$STUB"
check "minimum 1 for replicaCount"           grep -q '"minimum": 1' "$STUB"
check "image required"                       grep -q '"required"' "$STUB"
check "repository required property"         grep -q '"repository"' "$STUB"
check "pullPolicy enum defined"              grep -q '"IfNotPresent"' "$STUB"
check "service.port maximum 65535"           grep -q '65535' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
