#!/usr/bin/env bash

find_by_extension() {
  local dir="$1"
  local ext="$2"
  find "$dir" -type f -name "*.${ext}" | sort
}

make_executable() {
  local dir="$1"
  find "$dir" -type f -name "*.sh" -exec chmod +x {} +
}

ensure_dir() {
  local path="$1"
  if [[ -d "$path" ]]; then
    echo "exists"
  else
    mkdir -p "$path"
    echo "created"
  fi
}

# --- main ---
tmpdir=$(mktemp -d)
touch "${tmpdir}/a.sh" "${tmpdir}/b.sh" "${tmpdir}/c.txt"
find_by_extension "$tmpdir" "sh"
make_executable "$tmpdir"
ensure_dir "${tmpdir}/new/nested"
ensure_dir "${tmpdir}/new/nested"
rm -rf "$tmpdir"
