## What you build

You write three classifier functions with `[[ ]]` and `case`. In Bash, a condition is an exit code, not a boolean expression. That one fact explains `if`, `[[ ]]` and `case`. This lesson builds on **Variables & Strings**.

## Key concepts

### `if` branches on an exit code

`if` runs a command. Exit code 0 means true, and any other code means false. This is the opposite of C, where 0 is false.

```bash
if grep -q "error" logfile.txt; then
  echo "errors found"
fi
```

`grep -q` exits 0 when it finds a match and 1 when it does not.

### `[[ ]]` is the Bash test keyword

`[[ ]]` is a keyword, not a command. It does not word-split or glob its operands. Always use `[[ ]]` in place of `[ ]` in Bash.

```bash
if [[ "$status" == "ok" ]]; then
  echo "all good"
elif [[ "$count" -gt 10 ]]; then
  echo "too many"
else
  echo "something else"
fi
```

### String tests use `==`, number tests use `-eq`

Strings and integers have different operators. Do not put quotes around a regex pattern after `=~`.

```bash
[[ -z "$var" ]]     # empty or unset
[[ -n "$var" ]]     # not empty
[[ "$a" == "$b" ]]  # strings equal
[[ "$a" != "$b" ]]  # strings differ
[[ "$a" =~ ^[0-9]+$ ]]  # regex match

[[ $a -eq $b ]]  # equal
[[ $a -ne $b ]]  # not equal
[[ $a -lt $b ]]  # less than
[[ $a -le $b ]]  # less than or equal
[[ $a -gt $b ]]  # greater than
[[ $a -ge $b ]]  # greater than or equal
```

### File tests check the file system

Each file test is true or false for one path.

```bash
[[ -f "$path" ]]  # a regular file
[[ -d "$path" ]]  # a directory
[[ -r "$path" ]]  # readable
[[ -x "$path" ]]  # executable
[[ -s "$path" ]]  # exists, size > 0
```

### `&&`, `||` and `!` combine tests

Inside `[[ ]]`, you can use these operators directly. Outside, `&&` and `||` join commands.

```bash
[[ -f "$f" && -r "$f" ]]  # AND
[[ -z "$a" || -z "$b" ]]  # OR
[[ ! -d "$dir" ]]         # NOT
```

### `case` matches glob patterns

`case` replaces a long `if`/`elif` chain. Each clause ends with `;;`. Patterns are globs, for example `*.log)` or `[0-9]*)`.

```bash
case "$extension" in
  txt|md)
    echo "text file"
    ;;
  sh|bash)
    echo "shell script"
    ;;
  *)
    echo "unknown"
    ;;
esac
```

## Watch out

- `[ ]` is the POSIX `test` command. Bash word-splits and globs `$a` before `[` sees it.
- `[[ ]]` skips that expansion and supports `&&`, `||` and `=~`. Use `[ ]` only for POSIX `sh`.
- `[[ "10" -lt "9" ]]` is false, because `-lt` compares numbers.
- `[[ "10" < "9" ]]` is true, because `<` compares strings. Use `-lt` and `-gt` for numbers.
- `[ -z $var ]` with an empty `$var` becomes `[ -z ]`. Quote it: `[ -z "$var" ]`.
- An unquoted empty variable in `[ ]` can also give `unary operator expected`. `[[ ]]` does not have this problem.
- Plain `;;` does not fall through. A C `switch` does.
- `;&` runs the next clause. `;;&` tests the next patterns.

## The task

You write three classifier functions. Use `[[ ]]` and `case`. Each function prints one word with `echo`.

1. `classify_number n` prints `positive`, `negative` or `zero`.
2. `file_status path` prints `missing`, `directory`, `empty-file` or `file`.
3. `file_status` checks in this order. A path that does not exist is `missing`.
4. A directory is `directory`. A regular file of size 0 is `empty-file`. Any other path is `file`.
5. `day_type day` takes a day name from `Monday` to `Sunday`. It prints `weekday` or `weekend`.
6. In `day_type`, use a `case` statement. Use `Saturday|Sunday` and the five weekday names as patterns.

```bash
classify_number 42     # positive
classify_number -7     # negative
classify_number 0      # zero
classify_number -1000  # negative

# $dir is a directory. $full holds
# text. $empty has 0 bytes.
file_status "$dir"          # directory
file_status "$full"         # file
file_status "$empty"        # empty-file
file_status "$dir/nothere"  # missing

day_type "Saturday"   # weekend
day_type "Sunday"     # weekend
day_type "Monday"     # weekday
day_type "Friday"     # weekday
day_type "Wednesday"  # weekday
```
