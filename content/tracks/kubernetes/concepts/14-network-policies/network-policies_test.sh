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

echo "Running network-policies tests against stub.yaml..."

check "kind NetworkPolicy appears twice" bash -c \
  "[[ \$(grep -cE '^kind:\s*NetworkPolicy\s*\$' '$STUB') -ge 2 ]]"
check "policy name deny-all"          grep -qE '^\s*name:\s*deny-all\s*$'             "$STUB"
check "policy name allow-api"         grep -qE '^\s*name:\s*allow-api\s*$'            "$STUB"
check "podSelector empty {} (deny-all)" grep -qE '^\s*podSelector:\s*\{\s*\}\s*$'     "$STUB"
check "policyTypes Ingress"           grep -qE '^\s*-\s*Ingress\s*$'                  "$STUB"
check "policyTypes Egress"            grep -qE '^\s*-\s*Egress\s*$'                   "$STUB"
check "allow-api podSelector app: api" grep -qE '^\s*app:\s*api\s*$'                  "$STUB"
check "ingress key present"           grep -qE '^\s*ingress:\s*$'                     "$STUB"
check "ingress from podSelector app: web" grep -qE '^\s*app:\s*web\s*$'               "$STUB"
check "ingress port 8080 TCP"         bash -c "
  grep -qE '^\s*-?\s*protocol:\s*TCP\s*\$' '$STUB' && grep -qE '^\s*port:\s*8080\s*\$' '$STUB'
"
check "egress key present"            grep -qE '^\s*egress:\s*$'                      "$STUB"
check "egress ipBlock cidr 10.0.0.0/16" grep -qE '^\s*cidr:\s*10\.0\.0\.0/16\s*$'      "$STUB"
check "egress port 5432 TCP"          grep -qE '^\s*port:\s*5432\s*$'                 "$STUB"
check "egress namespaceSelector kube-system" grep -qE '^\s*kubernetes\.io/metadata\.name:\s*kube-system\s*$' "$STUB"
check "egress port 53 UDP"            bash -c "
  grep -qE '^\s*-?\s*protocol:\s*UDP\s*\$' '$STUB' && grep -qE '^\s*port:\s*53\s*\$' '$STUB'
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
