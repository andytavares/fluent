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

echo "Running rollout-strategies tests against stub.yaml..."

check "kind is Deployment"           grep -qE '^kind:\s*Deployment\s*$'            "$STUB"
check "name is api"                  grep -qE '^\s*name:\s*api\s*$'                "$STUB"
check "replicas is 10"               grep -qE '^\s*replicas:\s*10\s*$'             "$STUB"
check "minReadySeconds is 10"        grep -qE '^\s*minReadySeconds:\s*10\s*$'      "$STUB"
check "strategy.type is RollingUpdate" grep -qE '^\s*type:\s*RollingUpdate\s*$'    "$STUB"
check "rollingUpdate key present"    grep -qE '^\s*rollingUpdate:\s*$'             "$STUB"
check "maxSurge is 2"                grep -qE '^\s*maxSurge:\s*2\s*$'              "$STUB"
check "maxUnavailable is 0"          grep -qE '^\s*maxUnavailable:\s*0\s*$'        "$STUB"
check "selector.matchLabels app: api" grep -qE '^\s*app:\s*api\s*$'                "$STUB"
check "container named api"          grep -qE '^\s*-\s*name:\s*api\s*$'            "$STUB"
check "image is api:2.0"             grep -qE '^\s*image:\s*api:2\.0\s*$'          "$STUB"
check "containerPort is 8080"        grep -qE '^\s*-?\s*containerPort:\s*8080\s*$' "$STUB"

check "strategy block precedes template block" bash -c "
  strategy_line=\$(grep -n '^\s*strategy:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  template_line=\$(grep -n '^\s*template:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$strategy_line\" && -n \"\$template_line\" && \"\$template_line\" -gt \"\$strategy_line\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
