#!/usr/bin/env bash
# In production scripts: set -euo pipefail goes here, after the shebang.

parse_args() {
  local verbose=false
  local output=""
  local OPTIND=1

  while getopts ":vo:" opt; do
    case "$opt" in
      v) verbose=true ;;
      o) output="$OPTARG" ;;
      :) echo "error: -$OPTARG requires an argument" >&2; return 1 ;;
      \?) echo "error: unknown option -$OPTARG" >&2; return 1 ;;
    esac
  done
  shift $(( OPTIND - 1 ))

  if [[ $# -lt 1 ]]; then
    echo "error: missing input" >&2
    return 1
  fi

  local input="$1"
  echo "verbose=${verbose} output=${output} input=${input}"
}

safe_divide() {
  local a="$1"
  local b="$2"
  if [[ $b -eq 0 ]]; then
    echo "error: division by zero" >&2
    return 1
  fi
  echo $(( a / b ))
}

with_tempfile() {
  (
    local tmpfile
    tmpfile=$(mktemp)
    trap 'rm -f "$tmpfile"' EXIT
    echo "hello from tempfile" > "$tmpfile"
    cat "$tmpfile"
  )
}

# --- main ---
parse_args -v -o report.txt myinput
safe_divide 10 2
with_tempfile
