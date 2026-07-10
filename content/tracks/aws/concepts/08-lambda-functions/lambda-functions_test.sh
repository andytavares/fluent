#!/usr/bin/env bash
set -uo pipefail

STUB="$(dirname "$0")/stub.sh"

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

echo "Running lambda-functions tests against stub.sh..."

check "writes an exports.handler"           grep -qE 'exports\.handler'                     "$STUB"
check "handler returns statusCode 200"      grep -qE 'statusCode:\s*200'                     "$STUB"
check "zips function.zip"                   grep -qE '^zip function\.zip'                    "$STUB"
check "creates function hello-world"        grep -qE 'lambda create-function'                "$STUB"
check "function-name hello-world"           grep -qE -- '--function-name hello-world'        "$STUB"
check "runtime nodejs18.x"                  grep -qE -- '--runtime nodejs18\.x'               "$STUB"
check "handler flag index.handler"          grep -qE -- '--handler index\.handler'            "$STUB"
check "role references lambda-exec-role"    grep -qE 'role/lambda-exec-role'                  "$STUB"
check "zip-file uses fileb://"              grep -qE -- '--zip-file fileb://function\.zip'    "$STUB"
check "invokes the function"                grep -qE 'lambda invoke'                          "$STUB"
check "invoke payload has name world"       grep -qE '"name":\s*"world"'                      "$STUB"
check "invoke uses raw-in-base64-out"       grep -qE 'raw-in-base64-out'                      "$STUB"
check "updates env vars TABLE_NAME/LOG_LEVEL" grep -qE 'TABLE_NAME=Orders,LOG_LEVEL=info'      "$STUB"
check "sets timeout 10"                     grep -qE -- '--timeout 10'                        "$STUB"
check "sets memory-size 512"                grep -qE -- '--memory-size 512'                   "$STUB"
check "publishes a version"                 grep -qE 'lambda publish-version'                 "$STUB"
check "creates alias prod"                  grep -qE 'lambda create-alias'                    "$STUB"
check "alias name is prod"                  grep -qE -- '--name prod'                          "$STUB"
check "alias points at version 1"           grep -qE -- '--function-version 1'                 "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
