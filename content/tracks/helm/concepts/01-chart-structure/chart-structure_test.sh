#!/usr/bin/env bash
set -euo pipefail

STUB="$(dirname "$0")/stub.yaml"

passed=0
failed=0

check() {
  local name="$1"; shift
  if "$@" &>/dev/null; then
    echo "  PASS: $name"
    ((passed++)) || true
  else
    echo "  FAIL: $name"
    ((failed++)) || true
  fi
}

echo "Running chart-structure tests against stub.yaml..."

check "apiVersion is v2"              grep -q 'apiVersion: v2'            "$STUB"
check "name is webapp"                grep -q 'name: webapp'              "$STUB"
check "type is application"           grep -q 'type: application'         "$STUB"
check "chart version is 0.1.0"        grep -q 'version: 0\.1\.0'         "$STUB"
check "appVersion is 2.3.1"           grep -q 'appVersion:.*2\.3\.1'     "$STUB"
check "has dependencies block"        grep -q 'dependencies:'            "$STUB"
check "redis dependency present"      grep -q 'name: redis'              "$STUB"
check "redis version 17.x.x"         grep -q '"17\.x\.x"'               "$STUB"
check "bitnami repository"            grep -q 'bitnami\.com'             "$STUB"
check "redis condition"               grep -q 'condition: redis\.enabled' "$STUB"
check "replicaCount is 2"             grep -q 'replicaCount: 2'          "$STUB"
check "image repository set"          grep -q 'repository: myregistry/webapp' "$STUB"
check "image pullPolicy set"          grep -q 'pullPolicy: IfNotPresent'  "$STUB"
check "redis.enabled is true"         grep -q 'enabled: true'            "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
