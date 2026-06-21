# Control Flow

## What you'll learn

Bash conditions are exit codes, not boolean expressions. Understanding that one fact unlocks all of `if`, `[[ ]]`, and `case`.

## Key concepts

**`if` runs a command and branches on its exit code:**

```bash
if grep -q "error" logfile.txt; then
  echo "errors found"
fi
```

`grep -q` exits 0 if found, 1 if not. `if` tests exit codes directly — no boolean conversion needed.

**`[[ ]]` is the modern test construct:**

```bash
if [[ "$status" == "ok" ]]; then
  echo "all good"
elif [[ "$count" -gt 10 ]]; then
  echo "too many"
else
  echo "something else"
fi
```

`[[ ]]` is a Bash keyword (not a command), so it handles word-splitting and globbing safely. Always prefer `[[ ]]` over `[ ]`.

**Common test operators:**

```bash
# String tests
[[ -z "$var" ]]        # true if var is empty or unset
[[ -n "$var" ]]        # true if var is non-empty
[[ "$a" == "$b" ]]     # string equality
[[ "$a" != "$b" ]]     # string inequality
[[ "$a" =~ ^[0-9]+$ ]] # regex match (no quotes around pattern)

# Numeric tests
[[ $a -eq $b ]]   # equal
[[ $a -ne $b ]]   # not equal
[[ $a -lt $b ]]   # less than
[[ $a -le $b ]]   # less than or equal
[[ $a -gt $b ]]   # greater than
[[ $a -ge $b ]]   # greater than or equal

# File tests
[[ -f "$path" ]]   # exists and is a regular file
[[ -d "$path" ]]   # exists and is a directory
[[ -r "$path" ]]   # readable
[[ -x "$path" ]]   # executable
[[ -s "$path" ]]   # exists and is non-empty (size > 0)
```

**Compound conditions:**

```bash
[[ -f "$f" && -r "$f" ]]   # AND
[[ -z "$a" || -z "$b" ]]   # OR
[[ ! -d "$dir" ]]           # NOT
```

**`case` statement — cleaner than long if/elif chains:**

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

Each pattern ends with `;;`. Patterns support globs: `*.log)`, `[0-9]*)`.

## vs other languages

| Concept | C/Python/JS | Bash |
|---------|-------------|------|
| Condition type | boolean expression | exit code (0 = true, non-zero = false) |
| Equality | `==` for numbers and strings | `-eq` for integers, `==` for strings |
| Truthiness | `0` is falsy in most languages | `0` is **success/true** in Bash |
| Switch/match | `switch`/`match` with values | `case` with glob patterns |
| Logical AND | `&&` inside an expression | `&&` between commands, or inside `[[ ]]` |

The inverted truthiness catches everyone: exit code `0` means success (true), non-zero means failure (false). The opposite of C.

## The task

Implement three functions:

**`classify_number n`** — echoes `positive`, `negative`, or `zero`.

**`file_status path`** — echoes `directory`, `file`, `empty-file`, or `missing`. Check if path doesn't exist first, then directory, then whether the file is empty (size 0), then regular file.

**`day_type day`** — accepts a day name (Monday–Sunday) and echoes `weekday` or `weekend`. Use a `case` statement.
