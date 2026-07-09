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

## Watch out

- **Unquoted expansion is the #1 shell bug.** `path=/tmp/my dir; ls $path` word-splits into `ls /tmp/my dir` — two arguments. Always write `"$path"`. The same applies to `"$@"` vs bare `$@` in function bodies.
- `${var}` vs `$var`: `$var` alone stops at the first character that can't be part of an identifier, so `echo "$names"` is fine, but `echo "$names_backup"` silently looks up a variable named `names_backup`, not `names` followed by literal text. Use `${names}_backup` whenever a variable is followed by more identifier characters.
- Arithmetic vs string context: `count="3" + "4"` does **not** add — that's still a string assignment (and a syntax error here). Arithmetic requires `$(( ))`: `count=$(( 3 + 4 ))`.
- `${var:-default}` does **not** assign `default` back to `var` — only `${var:=default}` does. Mixing these up means the "default" silently doesn't stick for later reads of the same variable.

## vs other languages

| Concept | Other languages | Bash |
|---------|----------------|------|
| Assignment | `x = 1` (spaces fine) | `x=1` (no spaces — ever) |
| Interpolation | `"Hello ${name}"` (JS/Ruby/etc.) | `"Hello ${name}"` (same syntax, but mandatory for adjacent text) |
| Types | int, string, bool, etc. | Everything is a string; arithmetic needs `$(( ))` |
| Null/None | explicit null type | unset variable; use `${var:-}` to avoid "unbound variable" errors |
| String concat | `a + b` or template literals | Just put them next to each other: `"${a}${b}"` |

## The task

You're writing three small string-handling functions. Each takes its arguments positionally (`$1`, `$2`, ...) and prints its result with `echo`.

**`greet name`** — echoes `Hello, <name>!`.

```bash
greet "Alice"        # Hello, Alice!
greet "Bob Smith"    # Hello, Bob Smith!
greet ""             # Hello, !
```

**`describe_file path`** — echoes `File: <basename> (ext: <extension>)`. Use parameter expansion only (`${var##pattern}` / `${var%%pattern}`) — no `basename`/`dirname` commands.

```bash
describe_file "/tmp/report.txt"          # File: report.txt (ext: txt)
describe_file "/home/user/scripts/deploy.sh"  # File: deploy.sh (ext: sh)
describe_file "/var/backup/archive.tar.gz"    # File: archive.tar.gz (ext: gz)
```

**`repeat_word word n`** — echoes `word` repeated `n` times on a single space-separated line.

```bash
repeat_word "hi" 3   # hi hi hi
repeat_word "go" 1   # go
repeat_word "go" 0   # (empty line — n=0 means no repetitions)
```
