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

echo "Running pipeline-basics tests against stub.yaml..."

check "has top-level steps key"        grep -qE '^steps:\s*$'                         "$STUB"
check "exactly three labeled steps"    bash -c "[[ \$(grep -c 'label:' '$STUB') -eq 3 ]]"

# --- Lint step ---
check "lint label present"             grep -qE 'label:\s*":mag: Lint"'                "$STUB"
check "lint key present"               grep -qE 'key:\s*"lint"'                        "$STUB"
check "lint command present"           grep -qE 'command:\s*"make lint"'                "$STUB"

# --- Test step ---
check "test label present"             grep -qE 'label:\s*":test_tube: Test"'          "$STUB"
check "test key present"               grep -qE 'key:\s*"test"'                        "$STUB"
check "test uses commands list"        grep -qE '^\s*commands:\s*$'                    "$STUB"
check "test runs make deps"            grep -qE '^\s*-\s*"make deps"\s*$'               "$STUB"
check "test runs make test"            grep -qE '^\s*-\s*"make test"\s*$'               "$STUB"

# --- Build step ---
check "build label present"            grep -qE 'label:\s*":package: Build"'           "$STUB"
check "build key present"              grep -qE 'key:\s*"build"'                        "$STUB"
check "build command present"          grep -qE 'command:\s*"make build"'               "$STUB"

# --- structural: deps precede build (make deps appears before make build) ---
check "make deps precedes make build" bash -c "
  deps_line=\$(grep -n '\"make deps\"' '$STUB' | head -1 | cut -d: -f1)
  build_line=\$(grep -n 'command:\s*\"make build\"' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$deps_line\" && -n \"\$build_line\" && \"\$deps_line\" -lt \"\$build_line\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
