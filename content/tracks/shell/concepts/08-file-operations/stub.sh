#!/usr/bin/env bash

# find_by_extension: echo sorted list of files under dir with given extension
# Usage: find_by_extension /path/to/dir sh
find_by_extension() {
  local dir="$1"
  local ext="$2"
  # TODO: use find, sort results
}

# make_executable: chmod +x all .sh files under dir
make_executable() {
  local dir="$1"
  # TODO: use find -exec or xargs
}

# ensure_dir: create path if missing; echo "created" or "exists"
ensure_dir() {
  local path="$1"
  # TODO: check if directory exists, mkdir -p if not
}

# --- main ---
tmpdir=$(mktemp -d)
touch "${tmpdir}/a.sh" "${tmpdir}/b.sh" "${tmpdir}/c.txt"
find_by_extension "$tmpdir" "sh"
make_executable "$tmpdir"
ensure_dir "${tmpdir}/new/nested"
ensure_dir "${tmpdir}/new/nested"
rm -rf "$tmpdir"
