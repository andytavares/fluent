#!/usr/bin/env bash

# max: echo the larger of two integers
max() {
  local a="$1"
  local b="$2"
  # TODO: compare and echo the larger value
}

# join_by: echo all args after the first, joined by $1
# Usage: join_by SEPARATOR [WORDS...]
# Example: join_by , a b c  →  a,b,c
join_by() {
  local sep="$1"
  shift
  # TODO: join remaining args with sep and echo
}

# repeat_func: call func n times, passing iteration number (1-based)
# Usage: repeat_func FUNCNAME N
repeat_func() {
  local func="$1"
  local n="$2"
  # TODO: loop n times, calling $func with the iteration number
}

# --- main ---
max 3 7
join_by , apple banana cherry
repeat_func echo 3
