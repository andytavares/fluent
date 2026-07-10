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

echo "Running artifacts tests against stub.yaml..."

check "build key present"                grep -qE 'key:\s*"build"'                        "$STUB"
check "build command present"            grep -qE 'command:\s*"make build"'                "$STUB"
check "build artifact_paths dist glob"   grep -qE '^\s*-\s*"dist/\*\*/\*"\s*$'              "$STUB"

check "test key present"                 grep -qE 'key:\s*"test"'                          "$STUB"
check "test depends_on build"            grep -qE 'depends_on:\s*"build"'                   "$STUB"
check "test downloads dist artifact"     grep -qE "buildkite-agent artifact download 'dist/\*\*/\*' \." "$STUB"
check "test runs make test"              grep -qE '^\s*-\s*"make test"\s*$'                 "$STUB"

check "package key present"              grep -qE 'key:\s*"package"'                       "$STUB"
check "package depends_on test"          grep -qE 'depends_on:\s*"test"'                    "$STUB"
check "package downloads dist artifact"  bash -c "[[ \$(grep -c \"buildkite-agent artifact download 'dist/\*\*/\*' \.\" '$STUB') -eq 2 ]]"
check "package runs make package"        grep -qE '^\s*-\s*"make package"\s*$'              "$STUB"
check "package artifact_paths release glob" grep -qE '^\s*-\s*"release/\*\.tar\.gz"\s*$'   "$STUB"

check "dependency chain build->test->package" bash -c "
  b=\$(grep -n 'key:\s*\"build\"' '$STUB' | head -1 | cut -d: -f1)
  t=\$(grep -n 'depends_on:\s*\"build\"' '$STUB' | head -1 | cut -d: -f1)
  p=\$(grep -n 'depends_on:\s*\"test\"' '$STUB' | head -1 | cut -d: -f1)
  [[ -n \"\$b\" && -n \"\$t\" && -n \"\$p\" && \"\$b\" -lt \"\$t\" && \"\$t\" -lt \"\$p\" ]]
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
