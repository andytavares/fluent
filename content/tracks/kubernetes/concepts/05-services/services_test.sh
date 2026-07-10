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

echo "Running services tests against stub.yaml..."

check "two documents separated by ---" bash -c "[[ \$(grep -c '^---$' '$STUB') -ge 1 ]]"
check "kind Service appears twice"    bash -c "[[ \$(grep -cE '^kind:\s*Service\s*\$' '$STUB') -ge 2 ]]"
check "service named web"             grep -qE '^\s*name:\s*web\s*$'                "$STUB"
check "service named db"              grep -qE '^\s*name:\s*db\s*$'                 "$STUB"
check "web service type ClusterIP"    grep -qE '^\s*type:\s*ClusterIP\s*$'          "$STUB"
check "web selector app: web"         grep -qE '^\s*app:\s*web\s*$'                 "$STUB"
check "web port 80"                   grep -qE '^\s*-?\s*port:\s*80\s*$'            "$STUB"
check "web targetPort 8080"           grep -qE '^\s*targetPort:\s*8080\s*$'         "$STUB"
check "db clusterIP is None"          grep -qE '^\s*clusterIP:\s*None\s*$'          "$STUB"
check "db selector app: db"           grep -qE '^\s*app:\s*db\s*$'                  "$STUB"
check "db port 5432"                  grep -qE '^\s*-?\s*port:\s*5432\s*$'          "$STUB"

check "db service (headless) comes after --- divider" bash -c "
  divider=\$(grep -n '^---\$' '$STUB' | head -1 | cut -d: -f1)
  clusterip_line=\$(grep -n '^\s*clusterIP:\s*None\s*\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$divider\" && -n \"\$clusterip_line\" && \"\$clusterip_line\" -gt \"\$divider\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
