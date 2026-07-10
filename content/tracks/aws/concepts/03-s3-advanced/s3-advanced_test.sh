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

echo "Running s3-advanced tests against stub.sh..."

check "creates bucket fluent-s3-advanced"     grep -qE 's3 mb s3://fluent-s3-advanced'          "$STUB"
check "enables bucket versioning"             grep -qE 'put-bucket-versioning'                  "$STUB"
check "versioning Status=Enabled"             grep -qE -- '--versioning-configuration Status=Enabled' "$STUB"
check "deletes report.csv"                    grep -qE 'delete-object'                           "$STUB"
check "delete-object key report.csv"          grep -qE -- '--key report\.csv'                    "$STUB"
check "lists object versions"                 grep -qE 'list-object-versions'                    "$STUB"
check "has an answer comment about delete markers" grep -qE '# answer:.*[Dd]elete'                "$STUB"
check "applies lifecycle configuration"       grep -qE 'put-bucket-lifecycle-configuration'      "$STUB"
check "lifecycle rule id archive-old-logs"    grep -qE 'archive-old-logs'                        "$STUB"
check "lifecycle prefix logs/"                grep -qE 'logs/'                                   "$STUB"
check "lifecycle transitions to STANDARD_IA"  grep -qE 'STANDARD_IA'                              "$STUB"
check "lifecycle expires after 365 days"      grep -qE '"Days":\s*365'                            "$STUB"
check "applies bucket policy"                 grep -qE 'put-bucket-policy'                        "$STUB"
check "policy allows s3:GetObject on public/*" grep -qE 'public/\*'                                "$STUB"
check "enables default encryption"            grep -qE 'put-bucket-encryption'                    "$STUB"
check "encryption uses aws:kms"               grep -qE 'aws:kms'                                  "$STUB"
check "configures static website hosting"     grep -qE 'put-bucket-website'                       "$STUB"
check "website index document index.html"     grep -qE 'index\.html'                              "$STUB"
check "website error document error.html"     grep -qE 'error\.html'                              "$STUB"

echo ""
echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]
