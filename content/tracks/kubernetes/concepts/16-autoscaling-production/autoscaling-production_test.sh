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

echo "Running autoscaling-production tests against stub.yaml..."

check "kind HorizontalPodAutoscaler present" grep -qE '^kind:\s*HorizontalPodAutoscaler\s*$' "$STUB"
check "kind PodDisruptionBudget present"     grep -qE '^kind:\s*PodDisruptionBudget\s*$'     "$STUB"
check "kind PriorityClass present"           grep -qE '^kind:\s*PriorityClass\s*$'          "$STUB"
check "kind Pod present"                     grep -qE '^kind:\s*Pod\s*$'                    "$STUB"

check "hpa scaleTargetRef Deployment"        grep -qE '^\s*kind:\s*Deployment\s*$'          "$STUB"
check "hpa scaleTargetRef name web"          grep -qE '^\s*name:\s*web\s*$'                 "$STUB"
check "hpa minReplicas 3"                    grep -qE '^\s*minReplicas:\s*3\s*$'            "$STUB"
check "hpa maxReplicas 20"                   grep -qE '^\s*maxReplicas:\s*20\s*$'           "$STUB"
check "hpa metrics type Resource"            grep -qE '^\s*-?\s*type:\s*Resource\s*$'       "$STUB"
check "hpa metrics resource name cpu"        grep -qE '^\s*name:\s*cpu\s*$'                 "$STUB"
check "hpa target type Utilization"          grep -qE '^\s*type:\s*Utilization\s*$'         "$STUB"
check "hpa target averageUtilization 70"     grep -qE '^\s*averageUtilization:\s*70\s*$'    "$STUB"
check "hpa scaleDown stabilizationWindowSeconds 300" grep -qE '^\s*stabilizationWindowSeconds:\s*300\s*$' "$STUB"

check "pdb name web-pdb"                     grep -qE '^\s*name:\s*web-pdb\s*$'             "$STUB"
check "pdb minAvailable 2"                    grep -qE '^\s*minAvailable:\s*2\s*$'           "$STUB"
check "pdb selector app: web"                 grep -qE '^\s*app:\s*web\s*$'                  "$STUB"

check "priorityclass name high-priority (>=1)" grep -qE '^\s*name:\s*high-priority\s*$'      "$STUB"
check "priorityclass value 1000000"           grep -qE '^value:\s*1000000\s*$'               "$STUB"
check "priorityclass globalDefault false"     grep -qE '^globalDefault:\s*false\s*$'         "$STUB"

check "pod priorityClassName high-priority"   grep -qE '^\s*priorityClassName:\s*high-priority\s*$' "$STUB"
check "pod terminationGracePeriodSeconds 30"  grep -qE '^\s*terminationGracePeriodSeconds:\s*30\s*$' "$STUB"
check "pod container image web:1.0"           grep -qE '^\s*image:\s*web:1\.0\s*$'           "$STUB"
check "pod preStop exec command"              grep -qE '^\s*command:\s*\["sleep",\s*"5"\]\s*$' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
