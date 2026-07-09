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

echo "Running production-patterns tests against stub.yaml..."

# --- NOTES.txt ---
check "Release.Name shown in NOTES"          grep -q '.Release.Name' "$STUB"
check "Release.Namespace shown in NOTES"     grep -q '.Release.Namespace' "$STUB"
check "Chart.AppVersion shown in NOTES"      grep -q '.Chart.AppVersion' "$STUB"
check "LoadBalancer conditional present"     grep -qE 'eq\s+\.Values\.service\.type\s+"LoadBalancer"' "$STUB"
check "kubectl get svc for LoadBalancer branch" grep -q 'kubectl get svc' "$STUB"
check "kubectl port-forward in else branch"  grep -q 'kubectl port-forward' "$STUB"
check "service.port used in port-forward"    grep -q '.Values.service.port' "$STUB"
check "if/else/end control flow present"     bash -c "
  grep -qE '\{\{-?\s*if\s+eq\s+\.Values\.service\.type' '$STUB' &&
  grep -qE '\{\{-?\s*else\s*-?\}\}' '$STUB' &&
  grep -qE '\{\{-?\s*end\s*-?\}\}' '$STUB'
"

# --- values.schema.json ---
check 'JSON Schema $schema field present'    grep -q 'json-schema.org' "$STUB"
check "schema type is object"                grep -qE '"type":\s*"object"' "$STUB"
check "replicaCount is typed integer"         bash -c "
  awk '/\"replicaCount\"/{p=1} p{print} p && /}/{c++} c==2{exit}' '$STUB' | grep -q '\"integer\"'
"
check "replicaCount minimum 1"               grep -qE '"minimum":\s*1\s*$' "$STUB"
check "image is required top-level"          grep -qE '"required":\s*\["image"\]' "$STUB"
check "image.repository required"            bash -c "
  awk '/\"image\":/{p=1} p{print}' '$STUB' | grep -q '\"required\":\s*\[\"repository\"\]'
"
check "image.pullPolicy enum has all 3 values" bash -c "
  grep -q '\"Always\"' '$STUB' && grep -q '\"IfNotPresent\"' '$STUB' && grep -q '\"Never\"' '$STUB'
"
check "service.type enum has all 3 values"   bash -c "
  grep -q '\"ClusterIP\"' '$STUB' && grep -q '\"NodePort\"' '$STUB' && grep -q '\"LoadBalancer\"' '$STUB'
"
check "service.port is integer type"         bash -c "
  awk '/\"port\":/{p=1} p{print} p && /}/{c++} c==2{exit}' '$STUB' | grep -q '\"integer\"'
"
check "service.port maximum 65535"           grep -q '65535' "$STUB"
check "service.port minimum 1"                bash -c "
  awk '/\"port\":/{p=1} p{print} p && /}/{c++} c==2{exit}' '$STUB' | grep -qE '\"minimum\":\s*1'
"

check "no leftover TODO comments"            bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
