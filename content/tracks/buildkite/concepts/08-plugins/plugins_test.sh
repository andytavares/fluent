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

echo "Running plugins tests against stub.yaml..."

check "build-test key present"          grep -qE 'key:\s*"build-test"'                       "$STUB"
check "build-test command present"      grep -qE 'command:\s*"npm install && npm test"'       "$STUB"
check "docker plugin pinned v5.13.0"    grep -qE '^\s*-\s*docker#v5\.13\.0:\s*$'               "$STUB"
check "docker plugin image node:20"     grep -qE 'image:\s*"node:20"'                          "$STUB"
check "docker plugin workdir /app"      grep -qE 'workdir:\s*"/app"'                           "$STUB"

check "compose-build key present"       grep -qE 'key:\s*"compose-build"'                      "$STUB"
check "compose-build depends_on build-test" grep -qE 'depends_on:\s*"build-test"'               "$STUB"
check "docker-compose plugin pinned v5.11.0" grep -qE '^\s*-\s*docker-compose#v5\.11\.0:\s*$'   "$STUB"
check "docker-compose build app"        grep -qE 'build:\s*"app"'                               "$STUB"
check "docker-compose image-repository" grep -qE 'image-repository:\s*"index\.docker\.io/myorg/myapp"' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
