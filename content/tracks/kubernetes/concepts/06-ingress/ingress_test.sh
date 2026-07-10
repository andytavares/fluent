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

echo "Running ingress tests against stub.yaml..."

check "apiVersion is networking.k8s.io/v1" grep -qE '^apiVersion:\s*networking\.k8s\.io/v1\s*$' "$STUB"
check "kind is Ingress"               grep -qE '^kind:\s*Ingress\s*$'                 "$STUB"
check "name is web"                   grep -qE '^\s*name:\s*web\s*$'                  "$STUB"
check "ingressClassName is nginx"     grep -qE '^\s*ingressClassName:\s*nginx\s*$'    "$STUB"
check "tls key present"               grep -qE '^\s*tls:\s*$'                         "$STUB"
check "tls host api.example.com"      grep -qE '^\s*-?\s*api\.example\.com\s*$'        "$STUB"
check "tls secretName api-tls"        grep -qE '^\s*secretName:\s*api-tls\s*$'         "$STUB"
check "rules key present"             grep -qE '^\s*rules:\s*$'                        "$STUB"
check "rule host api.example.com"     grep -qE '^\s*-?\s*host:\s*api\.example\.com\s*$' "$STUB"
check "path is /api"                  grep -qE '^\s*-?\s*path:\s*/api\s*$'             "$STUB"
check "pathType is Prefix"            grep -qE '^\s*pathType:\s*Prefix\s*$'            "$STUB"
check "backend service name api"      grep -qE '^\s*-?\s*name:\s*api\s*$'              "$STUB"
check "port.number 80 (backend)"      bash -c "[[ \$(grep -cE '^\s*number:\s*80\s*\$' '$STUB') -ge 2 ]]"
check "defaultBackend key present"    grep -qE '^\s*defaultBackend:\s*$'               "$STUB"
check "defaultBackend service name web" bash -c "
  db_line=\$(grep -nE '^\s*defaultBackend:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  web_line=\$(awk -v start=\"\$db_line\" 'NR > start && \$0 ~ /^[[:space:]]*name:[[:space:]]*web[[:space:]]*\$/ { print NR; exit }' '$STUB')
  [[ -n \"\$web_line\" ]]
"
check "backend api rule precedes defaultBackend" bash -c "
  api_line=\$(grep -nE '^\s*-?\s*name:\s*api\s*\$' '$STUB' | head -1 | cut -d: -f1)
  db_line=\$(grep -nE '^\s*defaultBackend:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$api_line\" && -n \"\$db_line\" && \"\$db_line\" -gt \"\$api_line\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
