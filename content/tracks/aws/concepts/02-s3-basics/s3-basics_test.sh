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

echo "Running s3-basics tests against stub.sh..."

check "creates bucket fluent-s3-basics"    grep -qE 's3 mb s3://fluent-s3-basics'                 "$STUB"
check "cp uploads data.txt"                grep -qE 's3 cp .*data\.txt s3://fluent-s3-basics/data\.txt' "$STUB"
check "mv relocates to archive/data.txt"   grep -qE 's3 mv'                                        "$STUB"
check "mv target is archive/data.txt"      grep -qE 'archive/data\.txt'                            "$STUB"
check "sync uploads local-dir"             grep -qE 's3 sync .*local-dir s3://fluent-s3-basics/local-dir' "$STUB"
check "presign command present"            grep -qE 's3 presign'                                   "$STUB"
check "presign targets archive/data.txt"   grep -qE 'archive/data\.txt'                            "$STUB"
check "presign uses --expires-in 3600"     grep -qE -- '--expires-in 3600'                         "$STUB"
check "put-object for big-export.bin"      grep -qE 's3api put-object'                              "$STUB"
check "put-object bucket flag"             grep -qE -- '--bucket fluent-s3-basics'                 "$STUB"
check "put-object key big-export.bin"      grep -qE -- '--key big-export\.bin'                     "$STUB"
check "put-object storage class STANDARD_IA" grep -qE -- '--storage-class STANDARD_IA'             "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
