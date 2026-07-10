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

echo "Running configmaps-secrets tests against stub.yaml..."

check "three documents separated by ---" bash -c "[[ \$(grep -c '^---$' '$STUB') -ge 2 ]]"
check "kind ConfigMap present"        grep -qE '^kind:\s*ConfigMap\s*$'               "$STUB"
check "kind Secret present"           grep -qE '^kind:\s*Secret\s*$'                  "$STUB"
check "kind Pod present"              grep -qE '^kind:\s*Pod\s*$'                     "$STUB"
check "configmap name app-config"     grep -qE '^\s*name:\s*app-config\s*$'           "$STUB"
check "configmap immutable true"      grep -qE '^immutable:\s*true\s*$'               "$STUB"
check "LOG_LEVEL info"                grep -qE '^\s*LOG_LEVEL:\s*"?info"?\s*$'        "$STUB"
check "FEATURE_X enabled"             grep -qE '^\s*FEATURE_X:\s*"?enabled"?\s*$'     "$STUB"
check "secret name app-secret"        grep -qE '^\s*name:\s*app-secret\s*$'           "$STUB"
check "secret type Opaque"            grep -qE '^type:\s*Opaque\s*$'                  "$STUB"
check "DB_PASSWORD base64 value"      grep -qE '^\s*DB_PASSWORD:\s*czNjcjN0\s*$'      "$STUB"
check "API_KEY plaintext value"       grep -qE '^\s*API_KEY:\s*"?plaintext-key-here"?\s*$' "$STUB"
check "pod name app"                  grep -qE '^\s*name:\s*app\s*$'                  "$STUB"
check "envFrom configMapRef app-config" grep -qE '^\s*name:\s*app-config\s*$'         "$STUB"
check "env DB_PASSWORD var name"      grep -qE '^\s*-?\s*name:\s*DB_PASSWORD\s*$'     "$STUB"
check "secretKeyRef key DB_PASSWORD"  grep -qE '^\s*key:\s*DB_PASSWORD\s*$'           "$STUB"
check "volumeMounts mountPath /etc/config" grep -qE '^\s*mountPath:\s*/etc/config\s*$' "$STUB"
check "volume name config-volume"     grep -qE '^\s*-?\s*name:\s*config-volume\s*$'   "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
