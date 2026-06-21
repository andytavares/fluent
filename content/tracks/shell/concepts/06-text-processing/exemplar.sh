#!/usr/bin/env bash

extract_emails() {
  grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
}

remove_comments() {
  grep -Ev '^\s*#'
}

sum_second_column() {
  awk 'BEGIN {s=0} {s+=$2} END {print s}'
}

# --- main ---
echo "contact admin@example.com or support@test.org for help" | extract_emails
printf "# comment\nactual line\n  # indented comment\nanother line\n" | remove_comments
printf "a 10\nb 20\nc 30\n" | sum_second_column
