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

echo "Running agents-and-targeting tests against stub.yaml..."

check "three agents blocks present"    bash -c "[[ \$(grep -c '^\s*agents:\s*\$' '$STUB') -eq 3 ]]"

# --- Build macOS ---
check "build-macos key present"        grep -qE 'key:\s*"build-macos"'    "$STUB"
check "build-macos label present"      grep -qE 'label:\s*":apple: Build macOS"' "$STUB"
check "build-macos queue is macos"     grep -qE 'queue:\s*"macos"'        "$STUB"
check "build-macos os is macos"        grep -qE 'os:\s*"macos"'           "$STUB"

# --- Build Linux ---
check "build-linux key present"        grep -qE 'key:\s*"build-linux"'    "$STUB"
check "build-linux label present"      grep -qE 'label:\s*":linux: Build Linux"' "$STUB"
check "build-linux queue is linux"     grep -qE 'queue:\s*"linux"'        "$STUB"
check "build-linux os is linux"        grep -qE 'os:\s*"linux"'           "$STUB"

# --- Deploy ---
check "deploy key present"             grep -qE 'key:\s*"deploy"'         "$STUB"
check "deploy label present"           grep -qE 'label:\s*":rocket: Deploy"' "$STUB"
check "deploy queue is deploy"         grep -qE 'queue:\s*"deploy"'       "$STUB"
check "deploy role is release"         grep -qE 'role:\s*"release"'      "$STUB"

# --- commands ---
check "build command appears twice"    bash -c "[[ \$(grep -c 'command:\s*\"make build\"' '$STUB') -eq 2 ]]"
check "deploy command present"         grep -qE 'command:\s*"make deploy"' "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
