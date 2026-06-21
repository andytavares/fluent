#!/usr/bin/env bash
set -uo pipefail

source "$(dirname "$0")/stub.sh"

passed=0
failed=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    echo "  PASS: $name"
    ((passed++))
  else
    echo "  FAIL: $name — expected '$expected', got '$actual'"
    ((failed++))
  fi
}

echo "=== file-operations ==="

tmpdir=$(mktemp -d)

# find_by_extension
touch "${tmpdir}/a.sh" "${tmpdir}/b.sh" "${tmpdir}/c.txt" "${tmpdir}/d.sh"
result=$(find_by_extension "$tmpdir" "sh")
check "find_by_extension count" "3" "$(echo "$result" | wc -l | tr -d ' ')"
check "find_by_extension no txt" "0" "$(echo "$result" | grep -c '\.txt' || true)"
check "find_by_extension sorted" "$result" "$(echo "$result" | sort)"

result_txt=$(find_by_extension "$tmpdir" "txt")
check "find_by_extension txt count" "1" "$(echo "$result_txt" | wc -l | tr -d ' ')"

# make_executable
chmod -x "${tmpdir}/a.sh" "${tmpdir}/b.sh" "${tmpdir}/d.sh"
make_executable "$tmpdir"
check "make_executable a.sh" "0" "$(test -x "${tmpdir}/a.sh"; echo $?)"
check "make_executable b.sh" "0" "$(test -x "${tmpdir}/b.sh"; echo $?)"
check "make_executable d.sh" "0" "$(test -x "${tmpdir}/d.sh"; echo $?)"
# .txt should not be affected (test it's not executable)
chmod -x "${tmpdir}/c.txt"
make_executable "$tmpdir"
check "make_executable skips txt" "1" "$(test -x "${tmpdir}/c.txt"; echo $?)"

# ensure_dir
check "ensure_dir creates" "created" "$(ensure_dir "${tmpdir}/new/nested")"
check "ensure_dir exists"  "exists"  "$(ensure_dir "${tmpdir}/new/nested")"
check "ensure_dir already there" "exists" "$(ensure_dir "$tmpdir")"

rm -rf "$tmpdir"

echo ""
echo "${passed} passed, ${failed} failed"
[[ $failed -eq 0 ]]
