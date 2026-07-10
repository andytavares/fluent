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

echo "Running deployments tests against stub.yaml..."

check "apiVersion is apps/v1"        grep -qE '^apiVersion:\s*apps/v1\s*$'         "$STUB"
check "kind is Deployment"           grep -qE '^kind:\s*Deployment\s*$'            "$STUB"
check "name is web"                  grep -qE '^\s*name:\s*web\s*$'                "$STUB"
check "replicas is 3"                grep -qE '^\s*replicas:\s*3\s*$'              "$STUB"
check "revisionHistoryLimit is 5"    grep -qE '^\s*revisionHistoryLimit:\s*5\s*$'  "$STUB"
check "selector.matchLabels present" grep -qE '^\s*matchLabels:\s*$'               "$STUB"
check "template key present"         grep -qE '^\s*template:\s*$'                  "$STUB"
check "template.metadata.labels present" grep -qE '^\s*labels:\s*$'                "$STUB"
check "at least two 'app: web' lines (selector + template)" bash -c \
  "[[ \$(grep -cE '^\s*app:\s*web\s*\$' '$STUB') -ge 2 ]]"
check "containers key present"       grep -qE '^\s*containers:\s*$'                "$STUB"
check "container named web"          grep -qE '^\s*-\s*name:\s*web\s*$'            "$STUB"
check "image is nginx:1.25"          grep -qE '^\s*image:\s*nginx:1\.25\s*$'       "$STUB"
check "containerPort is 8080"        grep -qE '^\s*-?\s*containerPort:\s*8080\s*$' "$STUB"

check "selector block precedes template block" bash -c "
  selector_line=\$(grep -n '^\s*selector:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  template_line=\$(grep -n '^\s*template:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$selector_line\" && -n \"\$template_line\" && \"\$template_line\" -gt \"\$selector_line\" ]]
"
check "matchLabels appears before template (selector contract order)" bash -c "
  matchlabels_line=\$(grep -n '^\s*matchLabels:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  template_line=\$(grep -n '^\s*template:\s*\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$matchlabels_line\" && -n \"\$template_line\" && \"\$template_line\" -gt \"\$matchlabels_line\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
