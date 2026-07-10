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

echo "Running statefulsets tests against stub.yaml..."

check "kind Service present"          grep -qE '^kind:\s*Service\s*$'                "$STUB"
check "kind StatefulSet present"      grep -qE '^kind:\s*StatefulSet\s*$'             "$STUB"
check "service clusterIP None"        grep -qE '^\s*clusterIP:\s*None\s*$'            "$STUB"
check "service/statefulset name db (>=2 occurrences)" bash -c \
  "[[ \$(grep -cE '^\s*name:\s*db\s*\$' '$STUB') -ge 2 ]]"
check "statefulset serviceName db"    grep -qE '^\s*serviceName:\s*db\s*$'            "$STUB"
check "replicas 3"                    grep -qE '^\s*replicas:\s*3\s*$'                "$STUB"
check "podManagementPolicy OrderedReady" grep -qE '^\s*podManagementPolicy:\s*OrderedReady\s*$' "$STUB"
check "selector/template app: db (>=2 occurrences)" bash -c \
  "[[ \$(grep -cE '^\s*app:\s*db\s*\$' '$STUB') -ge 2 ]]"
check "container named db"            grep -qE '^\s*-\s*name:\s*db\s*$'               "$STUB"
check "image postgres:15"             grep -qE '^\s*image:\s*postgres:15\s*$'         "$STUB"
check "containerPort 5432 (>=2, service + container)" bash -c \
  "[[ \$(grep -cE '^\s*-?\s*(container)?[Pp]ort:\s*5432\s*\$' '$STUB') -ge 2 ]]"
check "volumeClaimTemplates key present" grep -qE '^\s*volumeClaimTemplates:\s*$'      "$STUB"
check "volumeClaimTemplate name data"  grep -qE '^\s*name:\s*data\s*$'                 "$STUB"
check "volumeClaimTemplate accessModes ReadWriteOnce" grep -qE '^\s*-\s*ReadWriteOnce\s*$' "$STUB"
check "volumeClaimTemplate storage 10Gi" grep -qE '^\s*storage:\s*10Gi\s*$'            "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
