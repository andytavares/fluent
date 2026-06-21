#!/usr/bin/env bash

# extract_emails: read stdin, print one email address per line
extract_emails() {
  # TODO: use grep -oE with an email regex
  cat
}

# remove_comments: read stdin, drop lines starting with optional whitespace then #
remove_comments() {
  # TODO: use grep -v or sed to strip comment lines
  cat
}

# sum_second_column: read whitespace-separated stdin, echo sum of column 2
sum_second_column() {
  # TODO: use awk to accumulate and print the sum
  echo 0
}

# --- main ---
echo "contact admin@example.com or support@test.org for help" | extract_emails
printf "# comment\nactual line\n  # indented comment\nanother line\n" | remove_comments
printf "a 10\nb 20\nc 30\n" | sum_second_column
