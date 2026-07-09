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

echo "Running dependencies tests against stub.yaml..."

check "dependencies block present"          grep -qE '^dependencies:\s*$' "$STUB"
check "postgresql dependency name"          grep -qE '^\s*-\s*name:\s*postgresql\s*$' "$STUB"
check "postgresql version constraint"       grep -qE 'version:\s*"12\.x\.x"' "$STUB"
check "bitnami repository referenced twice" bash -c "[[ \$(grep -oE 'bitnami\.com' '$STUB' | wc -l) -ge 2 ]]"
check "postgresql condition"                grep -qE '^\s*condition:\s*postgresql\.enabled\s*$' "$STUB"
check "redis dependency name"                grep -qE '^\s*-\s*name:\s*redis\s*$' "$STUB"
check "redis version constraint"            grep -qE 'version:\s*"17\.x\.x"' "$STUB"
check "cache alias defined"                 grep -qE '^\s*alias:\s*cache\s*$' "$STUB"
check "redis condition (aliased) references redis.enabled" grep -qE '^\s*condition:\s*redis\.enabled\s*$' "$STUB"

check "postgresql enabled in values"        grep -qE '^postgresql:\s*$' "$STUB"
check "postgresql.enabled true"             bash -c "awk '/^postgresql:/{p=1;next} /^[a-zA-Z]/{p=0} p && /enabled: true/{f=1} END{exit !f}' '$STUB'"
check "postgresql.auth.database set"        grep -qE 'database:\s*myplatform\s*$' "$STUB"
check "postgresql.auth.username set"        grep -qE 'username:\s*platform\s*$' "$STUB"
check "cache block present (not redis:)"    grep -qE '^cache:\s*$' "$STUB"
check "no top-level redis: block in values" bash -c "
  # after the --- divider (values.yaml), there should be no top-level 'redis:' key —
  # the aliased subchart must be configured under 'cache:' instead
  divider=\$(grep -n '^---\$' '$STUB' | head -1 | cut -d: -f1)
  ! tail -n +\"\$divider\" '$STUB' | grep -qE '^redis:\s*\$'
"
check "cache.enabled true"                  bash -c "awk '/^cache:/{p=1;next} /^[a-zA-Z]/{p=0} p && /enabled: true/{f=1} END{exit !f}' '$STUB'"
check "cache.master.persistence.enabled false" grep -qE 'enabled:\s*false\s*$' "$STUB"
check "global.imageRegistry set"            grep -qE 'imageRegistry:\s*"gcr\.io/myproject"' "$STUB"
check "no leftover TODO comments"           bash -c "! grep -q 'TODO' '$STUB'"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
