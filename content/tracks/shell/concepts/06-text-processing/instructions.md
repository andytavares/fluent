## What you build

You write `extract_emails`, `remove_comments` and `sum_second_column`, which read text from stdin. `grep`, `sed` and `awk` do most log parsing and data extraction in shell scripts. This lesson builds on **Arrays**.

## Key concepts

### `grep` prints the lines that match a pattern

`grep -E 'pattern'` does the work of `re.search` in Python. `-v` keeps the lines that do not match. `-o` prints only the matched text.

```bash
# Basic search
grep "error" app.log
# Ignore case
grep -i "error" app.log
# Show line numbers
grep -n "error" app.log
# Count matching lines
grep -c "error" app.log
# Lines that do NOT match
grep -v "debug" app.log
# Extended regular expressions (ERE)
grep -E "error|warn" app.log
# Perl regex (not on all systems)
grep -P "\d{3}-\d{4}" contacts.txt
# Search a directory tree
grep -r "TODO" ./src/
# Print only the file names
grep -l "TODO" ./src/*.sh
```

### `sed` edits a stream of text

`sed 's/old/new/g'` does the work of `re.sub()` in Python. `\1` and `\2` insert capture groups.

```bash
# Replace the first match on each line
sed 's/foo/bar/' file.txt
# Replace all matches on each line
sed 's/foo/bar/g' file.txt
# All matches, ignore case
sed 's/foo/bar/gi' file.txt
# Print lines 5 to 10
sed -n '5,10p' file.txt
# Delete comment lines
sed '/^#/d' file.txt
# Edit in place (GNU sed)
sed -i 's/old/new/g' file.txt
# Edit in place (BSD sed, macOS)
sed -i '' 's/old/new/g' file.txt

# BRE groups (the default)
sed 's/\(first\) \(second\)/\2 \1/'
# ERE groups (-E)
sed -E 's/(first) (second)/\2 \1/'
```

### `awk` works on fields

`awk` splits each line into fields: `$1`, `$2`, and `$NF` for the last. `NR` is the line number. `-F:` splits like `line.split(':')` in Python.

```bash
# First field
awk '{print $1}' file.txt
# Last field
awk '{print $NF}' file.txt
# Split on ":"
awk -F: '{print $1}' /etc/passwd
# Line 3
awk 'NR==3' file.txt
# Lines 2 to 5
awk 'NR>=2 && NR<=5' file.txt
# Lines that match a pattern
awk '/pattern/' file.txt
# Print fields when a condition is true
awk '$3 > 100 {print $1, $3}' data
```

### `BEGIN` and `END` run before and after the input

`awk` is a full language, with variables, arrays, loops and functions. It can do complex CSV-style work without Python.

```bash
awk 'BEGIN {sum=0} {sum+=$2}
     END {print sum}' data.txt
```

### Pipes combine the three tools

`sort | uniq -c` counts repeated lines, like `Counter()` in Python.

```bash
# Count each IP, most frequent first
grep -oE '[0-9]+(\.[0-9]+){3}' access.log \
  | sort | uniq -c | sort -rn | head -10
```

## Watch out

- `grep` prints the whole matching line, not the matched text. Use `-o` or `-oE` for the match only.
- Plain `grep` and `sed` use POSIX Basic Regular Expressions (BRE).
- In BRE, `(`, `)`, `|`, `+` and `{` are literal unless you escape them with `\`.
- `grep -E`, `sed -E` and `egrep` use Extended syntax, where those characters are operators.
- A mix-up between BRE and ERE is the most common cause of a regex that does not match.
- GNU `sed -i 's/a/b/' f` works on Linux. BSD `sed` on macOS needs a backup suffix: `sed -i '' ...`.
- For scripts that run on both, check the platform or use `perl -pi -e`.
- `awk '{print $1}'` splits on runs of whitespace. Two spaces do not make an empty field.
- Python's `str.split(" ")` does make one. Set `-F` when the delimiter matters.

## The task

Write three functions that read text from stdin, not from arguments, and print to stdout. Call each one after a pipe.

1. `extract_emails` prints every email address in its input, one per line, in input order.
2. Use `grep -oE` with an email pattern. With no address, it prints nothing.
3. `remove_comments` removes each line that starts with `#`, after any leading whitespace.
4. It prints the other lines unchanged. Use `grep -v`, `grep -E -v` or `sed`.
5. `sum_second_column` reads lines of whitespace-separated columns.
6. It prints the sum of the second column as an integer. Use `awk`.
7. Empty input prints `0`.

```bash
echo "contact user@example.com" \
  | extract_emails
# user@example.com
echo "send to a@b.com and x@y.org today" \
  | extract_emails
# a@b.com
# x@y.org
echo "no addresses here" | extract_emails
# (nothing)

printf '%s\n' '# comment' 'real line' \
  '# skip' 'another' \
  | remove_comments
# real line
# another
printf '  # indented\ncode here\n' \
  | remove_comments
# code here
printf 'a\nb\nc\n' | remove_comments
# a
# b
# c

printf 'x 10\ny 20\nz 30\n' \
  | sum_second_column
# 60
printf 'item 42\n' | sum_second_column
# 42
printf '' | sum_second_column
# 0
```
