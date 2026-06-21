#!/usr/bin/env bash

# parse_args: parse -v, -o <output>, and a positional input argument
# Echo: "verbose=<true|false> output=<val|""> input=<val>"
# On missing input: echo "error: missing input" to stderr, return 1
parse_args() {
  local verbose=false
  local output=""
  # Reset OPTIND for subshell-safe parsing
  local OPTIND=1
  # TODO: use getopts to parse -v and -o, then shift, then validate positional
}

# safe_divide: echo integer a/b; on b=0 echo error to stderr and return 1
safe_divide() {
  local a="$1"
  local b="$2"
  # TODO: check for zero divisor, then echo result
}

# with_tempfile: create temp, write content, echo it, cleanup via trap
with_tempfile() {
  # TODO: mktemp, trap EXIT for cleanup, write, echo contents
}

# --- main ---
parse_args -v -o report.txt myinput
safe_divide 10 2
with_tempfile
