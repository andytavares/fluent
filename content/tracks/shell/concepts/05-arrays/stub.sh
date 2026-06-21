#!/usr/bin/env bash

# array_sum: echo the sum of all integer arguments
# Usage: array_sum 1 2 3 4
array_sum() {
  # TODO: iterate over "$@" and accumulate sum
}

# unique_sorted: echo unique sorted words, one per line
# Usage: unique_sorted banana apple apple cherry
unique_sorted() {
  # TODO: print each arg on its own line, pipe through sort -u
}

# invert_map: echo key=value pairs with key and value swapped
# Usage: invert_map a=1 b=2 c=3
# Output: 1=a\n2=b\n3=c
invert_map() {
  # TODO: split each arg on '=', swap, echo
}

# --- main ---
array_sum 1 2 3 4 5
unique_sorted banana apple apple cherry banana
invert_map a=1 b=2 c=3
