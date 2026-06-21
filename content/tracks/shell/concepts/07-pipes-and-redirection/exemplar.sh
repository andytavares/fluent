#!/usr/bin/env bash

count_matching() {
  local pattern="$1"
  local file="$2"
  local count
  count=$(grep -- "$pattern" "$file" | wc -l)
  echo "${count// /}"   # trim leading whitespace from wc -l output
}

merge_streams() {
  local cmd="$1"
  local output
  output=$(eval "$cmd" 2>&1)
  echo "$output"
}

top_n_words() {
  local n="$1"
  tr -cs '[:alpha:]' '\n' \
    | tr '[:upper:]' '[:lower:]' \
    | sort \
    | uniq -c \
    | sort -rn \
    | head -n "$n" \
    | awk '{print $1, $2}'
}

# --- main ---
tmpfile=$(mktemp)
printf "error: disk full\ninfo: ok\nerror: timeout\nwarn: slow\n" > "$tmpfile"
count_matching "error" "$tmpfile"
rm -f "$tmpfile"

merge_streams "echo hello; echo world >&2"

echo "the cat sat on the mat the cat" | top_n_words 3
