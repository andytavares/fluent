#!/usr/bin/env bash

# count_matching: echo number of lines in file matching pattern
# Must pipe grep output to wc -l (not use grep -c)
count_matching() {
  local pattern="$1"
  local file="$2"
  # TODO: grep pattern file | wc -l, then echo the trimmed count
}

# merge_streams: run cmd string, capture stdout+stderr merged, echo result
merge_streams() {
  local cmd="$1"
  # TODO: use eval and capture both streams with 2>&1
}

# top_n_words: read stdin, echo n most frequent words as "<count> <word>"
top_n_words() {
  local n="$1"
  # TODO: tr to split on non-alpha, sort, uniq -c, sort -rn, head -n
}

# --- main ---
tmpfile=$(mktemp)
printf "error: disk full\ninfo: ok\nerror: timeout\nwarn: slow\n" > "$tmpfile"
count_matching "error" "$tmpfile"
rm -f "$tmpfile"

merge_streams "echo hello; echo world >&2"

echo "the cat sat on the mat the cat" | top_n_words 3
