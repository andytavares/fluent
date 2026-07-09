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

echo "Running chart-structure tests against stub.yaml..."

# --- Chart.yaml ---
check "apiVersion is v2"              grep -qE '^apiVersion:\s*v2\s*$'          "$STUB"
check "name is webapp"                grep -qE '^name:\s*webapp\s*$'            "$STUB"
check "type is application"           grep -qE '^type:\s*application\s*$'       "$STUB"
check "description present"           grep -qE '^description:\s*\S+'            "$STUB"
check "chart version is 0.1.0"        grep -qE '^version:\s*0\.1\.0\s*$'        "$STUB"
check "appVersion is 2.3.1"           grep -qE '^appVersion:\s*"?2\.3\.1"?\s*$'  "$STUB"
check "has dependencies block"        grep -qE '^dependencies:\s*$'             "$STUB"
check "redis dependency present"      grep -qE '^\s*-\s*name:\s*redis\s*$'      "$STUB"
check "redis version 17.x.x"          grep -qE 'version:\s*"17\.x\.x"'          "$STUB"
check "bitnami repository"            grep -qE 'repository:\s*"?https://charts\.bitnami\.com/bitnami"?' "$STUB"
check "redis condition"               grep -qE '^\s*condition:\s*redis\.enabled\s*$' "$STUB"

# --- values.yaml ---
check "replicaCount is 2"             grep -qE '^replicaCount:\s*2\s*$'         "$STUB"
check "image.repository set"          grep -qE '^\s*repository:\s*myregistry/webapp\s*$' "$STUB"
check "image.tag is empty string"     grep -qE '^\s*tag:\s*""\s*$'              "$STUB"
check "image.pullPolicy is IfNotPresent" grep -qE '^\s*pullPolicy:\s*IfNotPresent\s*$' "$STUB"
check "redis block present"           grep -qE '^redis:\s*$'                    "$STUB"
check "redis.enabled is true"         grep -qE '^\s*enabled:\s*true\s*$'        "$STUB"

# --- structural: two documents separated by --- ---
check "Chart.yaml and values.yaml separated by ---" bash -c "[[ \$(grep -c '^---$' '$STUB') -ge 1 ]]"
check "redis block comes after --- (values.yaml, not Chart.yaml)" bash -c "
  divider=\$(grep -n '^---\$' '$STUB' | head -1 | cut -d: -f1)
  redis_enabled_line=\$(grep -n '^redis:\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$divider\" && -n \"\$redis_enabled_line\" && \"\$redis_enabled_line\" -gt \"\$divider\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
