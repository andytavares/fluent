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

echo "Running matrix-and-parallelism tests against stub.yaml..."

check "test-matrix key present"          grep -qE 'key:\s*"test-matrix"'                     "$STUB"
check "test-matrix command interpolates" grep -qE 'command:\s*"make test LANG_VERSION=\{\{matrix\}\}"' "$STUB"
check "test-matrix has 3.9"              grep -qE '^\s*-\s*"3\.9"\s*$'                        "$STUB"
check "test-matrix has 3.10"             grep -qE '^\s*-\s*"3\.10"\s*$'                       "$STUB"
check "test-matrix has 3.11"             grep -qE '^\s*-\s*"3\.11"\s*$'                       "$STUB"

check "test-matrix-multi key present"    grep -qE 'key:\s*"test-matrix-multi"'                "$STUB"
check "multi-matrix setup present"       grep -qE '^\s*setup:\s*$'                            "$STUB"
check "multi-matrix os dimension"        grep -qE '^\s*os:\s*$'                                "$STUB"
check "multi-matrix arch dimension"      grep -qE '^\s*arch:\s*$'                               "$STUB"
check "multi-matrix os values"           bash -c "grep -qE '\"linux\"' '$STUB' && grep -qE '\"windows\"' '$STUB'"
check "multi-matrix arch values"         bash -c "grep -qE '\"amd64\"' '$STUB' && grep -qE '\"arm64\"' '$STUB'"
check "adjustments block present"        grep -qE '^\s*adjustments:\s*$'                        "$STUB"
check "adjustment skips windows/arm64"   grep -qE 'skip:\s*true'                                "$STUB"

check "test-shards key present"          grep -qE 'key:\s*"test-shards"'                       "$STUB"
check "test-shards command present"      grep -qE 'command:\s*"make test-shard"'               "$STUB"
check "test-shards parallelism 4"        grep -qE '^\s*parallelism:\s*4\s*$'                    "$STUB"
check "parallelism not combined with matrix on same step" bash -c "
  ! awk '/key:\s*\"test-shards\"/,/^  - label:|\$/' '$STUB' | grep -qE '^\s*matrix:'
"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
