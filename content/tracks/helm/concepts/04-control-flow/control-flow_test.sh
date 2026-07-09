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

echo "Running control-flow tests against stub.yaml..."

check "if/else for pullPolicy"                grep -qE '\{\{-?\s*if\s+\.Values\.image\.pullPolicy\s*\}\}' "$STUB"
check "else branch present"                   grep -qE '\{\{-?\s*else\s*-?\}\}' "$STUB"
check "IfNotPresent fallback literal"          grep -q 'IfNotPresent' "$STUB"
check "at least 3 end tags (if/range/with)"    bash -c "[[ \$(grep -oE '\{\{-?\s*end\s*-?\}\}' '$STUB' | wc -l) -ge 3 ]]"
check "range over .Values.env"                grep -qE 'range\s+\.Values\.env' "$STUB"
check "outer if guards the env block"          grep -qE '\{\{-?\s*if\s+\.Values\.env\s*-?\}\}' "$STUB"
check ".name used inside range"                grep -q '{{ .name }}' "$STUB"
check ".value piped through quote inside range" grep -qE '\{\{\s*\.value\s*\|\s*quote\s*\}\}' "$STUB"
check "with for resources"                    grep -qE 'with\s+\.Values\.resources' "$STUB"
check "toYaml + nindent for resources"         grep -qE 'toYaml\s+\.\s*\|\s*nindent' "$STUB"
check "if for livenessProbe.enabled"           grep -qE '\{\{-?\s*if\s+\.Values\.livenessProbe\.enabled\s*\}\}' "$STUB"
check "livenessProbe.path referenced"          grep -q '.Values.livenessProbe.path' "$STUB"
check "livenessProbe.port referenced"          grep -q '.Values.livenessProbe.port' "$STUB"
check "livenessProbe.initialDelaySeconds referenced" grep -q '.Values.livenessProbe.initialDelaySeconds' "$STUB"
check "whitespace control used on if"          grep -qE '\{\{-\s*if' "$STUB"
check "whitespace control used on end"         grep -qE '\{\{-\s*end' "$STUB"
check "whitespace control used on range"       grep -qE '\{\{-\s*range' "$STUB"
check "whitespace control used on with"        grep -qE '\{\{-\s*with' "$STUB"
check "kind is Deployment"                     grep -qE '^kind:\s*Deployment\s*$' "$STUB"
check "no leftover TODO comments"              bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
