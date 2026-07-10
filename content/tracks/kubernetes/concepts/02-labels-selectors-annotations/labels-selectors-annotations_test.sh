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

echo "Running labels-selectors-annotations tests against stub.yaml..."

check "pod name is catalog"          grep -qE '^\s*name:\s*catalog\s*$'                "$STUB"
check "label app: catalog"           grep -qE '^\s*app:\s*catalog\s*$'                 "$STUB"
check "label tier: backend"          grep -qE '^\s*tier:\s*backend\s*$'                "$STUB"
check "label env: production"        grep -qE '^\s*env:\s*production\s*$'              "$STUB"
check "annotations key present"      grep -qE '^\s*annotations:\s*$'                    "$STUB"
check "annotation description"       grep -qE '^\s*description:\s*"?Catalog service backend"?\s*$' "$STUB"
check "annotation owner"             grep -qE '^\s*owner:\s*"?team-catalog"?\s*$'       "$STUB"
check "container image is catalog:1.0" grep -qE '^\s*image:\s*catalog:1\.0\s*$'         "$STUB"
check "two documents separated by ---" bash -c "[[ \$(grep -c '^---$' '$STUB') -ge 1 ]]"

check "selector block present"       grep -qE '^selector:\s*$'                         "$STUB"
check "matchLabels present"          grep -qE '^\s*matchLabels:\s*$'                    "$STUB"
check "matchLabels app: catalog"     grep -qE '^\s*app:\s*catalog\s*$'                  "$STUB"
check "matchLabels tier: backend"    grep -qE '^\s*tier:\s*backend\s*$'                 "$STUB"
check "matchExpressions present"     grep -qE '^\s*matchExpressions:\s*$'               "$STUB"
check "matchExpressions key env"     grep -qE '^\s*-?\s*key:\s*env\s*$'                 "$STUB"
check "matchExpressions operator In" grep -qE '^\s*operator:\s*In\s*$'                  "$STUB"
check "matchExpressions values"      grep -qE '^\s*values:\s*\[\s*production\s*,\s*staging\s*\]\s*$' "$STUB"

check "selector block comes after --- (not the Pod doc)" bash -c "
  divider=\$(grep -n '^---\$' '$STUB' | head -1 | cut -d: -f1)
  selector_line=\$(grep -n '^selector:\$' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$divider\" && -n \"\$selector_line\" && \"\$selector_line\" -gt \"\$divider\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
