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

echo "Running scheduling tests against stub.yaml..."

check "nodeSelector disktype: ssd"    grep -qE '^\s*disktype:\s*ssd\s*$'              "$STUB"
check "nodeAffinity required key present" grep -qE '^\s*requiredDuringSchedulingIgnoredDuringExecution:\s*$' "$STUB"
check "nodeAffinity arch key"         grep -qE '^\s*-?\s*key:\s*kubernetes\.io/arch\s*$' "$STUB"
check "nodeAffinity operator In"      bash -c "[[ \$(grep -cE '^\s*operator:\s*In\s*\$' '$STUB') -ge 2 ]]"
check "nodeAffinity values amd64"     grep -qE '^\s*values:\s*\[amd64\]\s*$'          "$STUB"
check "nodeAffinity preferred weight 50" grep -qE '^\s*-?\s*weight:\s*50\s*$'          "$STUB"
check "nodeAffinity preferred key zone" grep -qE '^\s*-?\s*key:\s*zone\s*$'           "$STUB"
check "nodeAffinity preferred values us-east-1a" grep -qE '^\s*values:\s*\[us-east-1a\]\s*$' "$STUB"
check "podAntiAffinity required key present" grep -qE '^\s*podAntiAffinity:\s*$'      "$STUB"
check "podAntiAffinity topologyKey hostname" grep -qE '^\s*topologyKey:\s*kubernetes\.io/hostname\s*$' "$STUB"
check "app: web appears >=3 times (labels, anti-affinity, spread)" bash -c \
  "[[ \$(grep -cE '^\s*app:\s*web\s*\$' '$STUB') -ge 3 ]]"
check "toleration key dedicated"      grep -qE '^\s*-?\s*key:\s*dedicated\s*$'        "$STUB"
check "toleration operator Equal"     grep -qE '^\s*operator:\s*Equal\s*$'            "$STUB"
check "toleration value gpu"          grep -qE '^\s*value:\s*gpu\s*$'                 "$STUB"
check "toleration effect NoSchedule"  grep -qE '^\s*effect:\s*NoSchedule\s*$'         "$STUB"
check "topologySpreadConstraints maxSkew 1" grep -qE '^\s*-?\s*maxSkew:\s*1\s*$'       "$STUB"
check "topologySpreadConstraints topologyKey zone" grep -qE '^\s*topologyKey:\s*topology\.kubernetes\.io/zone\s*$' "$STUB"
check "topologySpreadConstraints whenUnsatisfiable DoNotSchedule" grep -qE '^\s*whenUnsatisfiable:\s*DoNotSchedule\s*$' "$STUB"
check "container image web:1.0"       grep -qE '^\s*image:\s*web:1\.0\s*$'            "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
