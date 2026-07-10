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

echo "Running rbac-serviceaccounts tests against stub.yaml..."

check "kind ServiceAccount present"   grep -qE '^kind:\s*ServiceAccount\s*$'          "$STUB"
check "kind Role present"             grep -qE '^kind:\s*Role\s*$'                    "$STUB"
check "kind RoleBinding present"      grep -qE '^kind:\s*RoleBinding\s*$'             "$STUB"
check "kind Pod present"              grep -qE '^kind:\s*Pod\s*$'                     "$STUB"
check "serviceaccount name pod-reader (>=1)" grep -qE '^\s*name:\s*pod-reader\s*$'    "$STUB"
check "role name pod-reader-role"     grep -qE '^\s*name:\s*pod-reader-role\s*$'      "$STUB"
check "rules apiGroups core (empty string)" grep -qE '^\s*-?\s*apiGroups:\s*\[""\]\s*$' "$STUB"
check "rules resources pods"          grep -qE '^\s*resources:\s*\["pods"\]\s*$'      "$STUB"
check "rules verbs get/list/watch"    grep -qE '^\s*verbs:\s*\["get",\s*"list",\s*"watch"\]\s*$' "$STUB"
check "rolebinding name pod-reader-binding" grep -qE '^\s*name:\s*pod-reader-binding\s*$' "$STUB"
check "subject kind ServiceAccount"   grep -qE '^\s*-?\s*kind:\s*ServiceAccount\s*$'  "$STUB"
check "subject namespace default"     grep -qE '^\s*namespace:\s*default\s*$'        "$STUB"
check "roleRef kind Role"             grep -qE '^\s*kind:\s*Role\s*$'                 "$STUB"
check "roleRef name pod-reader-role"  bash -c "[[ \$(grep -cE '^\s*name:\s*pod-reader-role\s*\$' '$STUB') -ge 2 ]]"
check "roleRef apiGroup rbac.authorization.k8s.io" grep -qE '^\s*apiGroup:\s*rbac\.authorization\.k8s\.io\s*$' "$STUB"
check "pod name watcher"              grep -qE '^\s*name:\s*watcher\s*$'             "$STUB"
check "pod serviceAccountName pod-reader" grep -qE '^\s*serviceAccountName:\s*pod-reader\s*$' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
