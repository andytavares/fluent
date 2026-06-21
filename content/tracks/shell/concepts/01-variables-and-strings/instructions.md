# Variables & Strings

## What you'll learn

How Bash stores and expands variables — including the quoting rules that trip up every newcomer coming from any typed language.

## Key concepts

**Assignment — no spaces around `=`:**

```bash
name="Alice"
count=42
path=/usr/local/bin   # no quotes needed when no spaces
```

Any space around `=` is a syntax error. Bash parses `name = "Alice"` as running a command called `name` with arguments `=` and `Alice`.

**Expansion — `$var` vs `${var}`:**

```bash
echo $name            # basic expansion
echo ${name}          # explicit boundary — required before text: ${name}s → "Alices"
echo "${name} wins"   # always double-quote expansions in strings
```

**Single vs double quotes:**

```bash
greeting="Hello, $name"    # double: variables expand  → Hello, Alice
literal='Hello, $name'     # single: nothing expands   → Hello, $name
```

**Command substitution — `$()`:**

```bash
today=$(date +%Y-%m-%d)
files=$(ls -1 | wc -l)
echo "Today is $today, $files files here"
```

Backtick syntax `` `cmd` `` does the same thing but doesn't nest cleanly. Always use `$()`.

**Special variables:**

```bash
$?   # exit code of last command (0 = success)
$$   # PID of current shell
$0   # name of the script
$#   # number of arguments passed to the script
$@   # all arguments as separate words
```

**Parameter expansion tricks:**

```bash
${var:-default}    # use "default" if var is unset or empty
${var:=default}    # assign and use "default" if var is unset or empty
${#var}            # length of var's value
${var^^}           # uppercase (Bash 4+)
${var,,}           # lowercase (Bash 4+)
${var#prefix}      # strip shortest prefix match
${var%suffix}      # strip shortest suffix match
```

## vs other languages

| Concept | Other languages | Bash |
|---------|----------------|------|
| Assignment | `x = 1` (spaces fine) | `x=1` (no spaces — ever) |
| Interpolation | `"Hello ${name}"` (JS/Ruby/etc.) | `"Hello ${name}"` (same syntax, but mandatory for adjacent text) |
| Types | int, string, bool, etc. | Everything is a string; arithmetic needs `$(( ))` |
| Null/None | explicit null type | unset variable; use `${var:-}` to avoid "unbound variable" errors |
| String concat | `a + b` or template literals | Just put them next to each other: `"${a}${b}"` |

## The task

Implement three functions:

**`greet name`** — echoes `Hello, <name>!`

**`describe_file path`** — echoes `File: <basename> (ext: <extension>)`. Given `/tmp/report.txt`, print `File: report.txt (ext: txt)`. Use parameter expansion — no external commands.

**`repeat_word word n`** — echoes `word` repeated `n` times on a single space-separated line. `repeat_word hi 3` → `hi hi hi`.
