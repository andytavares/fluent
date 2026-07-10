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

echo "Running probes tests against stub.yaml..."

check "kind is Pod"                   grep -qE '^kind:\s*Pod\s*$'                    "$STUB"
check "livenessProbe key present"     grep -qE '^\s*livenessProbe:\s*$'               "$STUB"
check "readinessProbe key present"    grep -qE '^\s*readinessProbe:\s*$'              "$STUB"
check "startupProbe key present"      grep -qE '^\s*startupProbe:\s*$'                "$STUB"
check "liveness path /healthz"        grep -qE '^\s*path:\s*/healthz\s*$'             "$STUB"
check "readiness path /ready"         grep -qE '^\s*path:\s*/ready\s*$'               "$STUB"
check "startup path /startupz"        grep -qE '^\s*path:\s*/startupz\s*$'            "$STUB"
check "port 8080 appears 3 times"     bash -c "[[ \$(grep -cE '^\s*port:\s*8080\s*\$' '$STUB') -ge 3 ]]"
check "liveness initialDelaySeconds 15" grep -qE '^\s*initialDelaySeconds:\s*15\s*$'  "$STUB"
check "periodSeconds 10 appears (liveness+startup)" bash -c "[[ \$(grep -cE '^\s*periodSeconds:\s*10\s*\$' '$STUB') -ge 2 ]]"
check "liveness timeoutSeconds 2"     grep -qE '^\s*timeoutSeconds:\s*2\s*$'          "$STUB"
check "failureThreshold 3 appears (liveness+readiness)" bash -c "[[ \$(grep -cE '^\s*failureThreshold:\s*3\s*\$' '$STUB') -ge 2 ]]"
check "readiness periodSeconds 5"     grep -qE '^\s*periodSeconds:\s*5\s*$'           "$STUB"
check "startup failureThreshold 30"   grep -qE '^\s*failureThreshold:\s*30\s*$'       "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
