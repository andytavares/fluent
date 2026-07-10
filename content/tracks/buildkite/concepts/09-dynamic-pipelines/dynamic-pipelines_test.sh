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

echo "Running dynamic-pipelines tests against stub.yaml..."

check "generate key present"            grep -qE 'key:\s*"generate"'                          "$STUB"
check "generate label present"          grep -qE 'label:\s*":pipeline: Generate pipeline"'     "$STUB"
check "command runs generator script"   grep -qE '\.buildkite/generate-pipeline\.sh'           "$STUB"
check "command pipes to pipeline upload" grep -qE 'buildkite-agent pipeline upload'            "$STUB"

check "commented example steps block"   grep -qE '^#\s*steps:\s*$'                             "$STUB"
check "commented example has test step" grep -qE '^#.*label:\s*":test_tube: Test unit"'        "$STUB"
check "commented example has deploy step" grep -qE '^#.*label:\s*":rocket: Deploy"'             "$STUB"
check "commented example has conditional deploy" grep -qE '^#\s*if:\s*build\.branch == "main"' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
