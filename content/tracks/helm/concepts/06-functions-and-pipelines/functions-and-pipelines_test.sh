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

echo "Running functions-and-pipelines tests against stub.yaml..."

check "kind is Secret"                  grep -qE '^kind:\s*Secret\s*$' "$STUB"
check "type is Opaque"                  grep -qE '^type:\s*Opaque\s*$' "$STUB"
check "printf combines Release.Name and db-credentials" grep -qE 'printf\s+"%s-db-credentials"\s+\.Release\.Name' "$STUB"
check "name pipeline: printf | trunc 63 | trimSuffix"    grep -qE 'printf.*\|\s*trunc 63\s*\|\s*trimSuffix\s*"-"' "$STUB"
check "namespace from Release.Namespace" grep -qE 'namespace:\s*\{\{\s*\.Release\.Namespace\s*\}\}' "$STUB"
check "environment label pipeline"       grep -qE 'environment:\s*\{\{\s*\.Values\.global\.env\s*\|\s*default\s*"production"\s*\|\s*lower\s*\}\}' "$STUB"
check "DB_HOST: required then b64enc"    grep -qE 'DB_HOST:\s*\{\{\s*required\s+"db\.host is required"\s+\.Values\.db\.host\s*\|\s*b64enc\s*\}\}' "$STUB"
check "DB_PASSWORD: required then b64enc" grep -qE 'DB_PASSWORD:\s*\{\{\s*required\s+"db\.password is required"\s+\.Values\.db\.password\s*\|\s*b64enc\s*\}\}' "$STUB"
check "DB_NAME: default | b64enc | quote" grep -qE 'DB_NAME:\s*\{\{\s*\.Values\.db\.name\s*\|\s*default\s*"appdb"\s*\|\s*b64enc\s*\|\s*quote\s*\}\}' "$STUB"
check "required used at least twice"     bash -c "[[ \$(grep -oE 'required' '$STUB' | wc -l) -ge 2 ]]"
check "b64enc used at least three times" bash -c "[[ \$(grep -oE 'b64enc' '$STUB' | wc -l) -ge 3 ]]"
check "pipeline operator used"           grep -q '|' "$STUB"
check "no leftover TODO comments"        bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
