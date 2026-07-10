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

echo "Running volumes-persistence tests against stub.yaml..."

check "kind PersistentVolumeClaim present" grep -qE '^kind:\s*PersistentVolumeClaim\s*$' "$STUB"
check "kind Pod present"              grep -qE '^kind:\s*Pod\s*$'                    "$STUB"
check "pvc name data-pvc"             grep -qE '^\s*name:\s*data-pvc\s*$'            "$STUB"
check "accessModes ReadWriteOnce"     grep -qE '^\s*-\s*ReadWriteOnce\s*$'            "$STUB"
check "storageClassName standard"     grep -qE '^\s*storageClassName:\s*standard\s*$' "$STUB"
check "storage request 10Gi"          grep -qE '^\s*storage:\s*10Gi\s*$'             "$STUB"
check "pod name app"                  grep -qE '^\s*name:\s*app\s*$'                 "$STUB"
check "volumeMounts mountPath /cache" grep -qE '^\s*mountPath:\s*/cache\s*$'          "$STUB"
check "volumeMounts mountPath /data"  grep -qE '^\s*mountPath:\s*/data\s*$'           "$STUB"
check "volume name cache"             grep -qE '^\s*-?\s*name:\s*cache\s*$'           "$STUB"
check "volume name data"              grep -qE '^\s*-?\s*name:\s*data\s*$'            "$STUB"
check "emptyDir present"              grep -qE '^\s*emptyDir:\s*\{\s*\}\s*$'          "$STUB"
check "persistentVolumeClaim claimName data-pvc" grep -qE '^\s*claimName:\s*data-pvc\s*$' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
