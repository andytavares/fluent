# Scripts & Arguments

## What you'll learn

You now know functions, control flow, and the filesystem tools; this lesson assembles them into a real script. The difference between a one-liner and a production script is mostly discipline: a proper shebang, `set -euo pipefail`, and structured argument parsing with `getopts`. These three things eliminate entire categories of bugs.

## Key concepts

**The shebang:**

```bash
#!/usr/bin/env bash
```

Always use `/usr/bin/env bash`, not `/bin/bash`. On some systems (macOS, NixOS, containers) bash lives elsewhere. `env` searches `$PATH`, finding whichever bash is first — usually the one you installed.

**`set -euo pipefail` — the mandatory safety net:**

```bash
set -e            # exit immediately on any error (non-zero exit code)
set -u            # treat unset variables as errors
set -o pipefail   # pipelines fail if any stage fails (not just the last)

# All three together, idiomatic form:
set -euo pipefail
```

Without `-e`, a script continues past errors silently. Without `-u`, typos in variable names silently expand to empty strings. Without `pipefail`, `false | echo "still running"` exits 0.

**`getopts` — POSIX option parsing:**

```bash
#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [-v] [-o output] <input>"
  exit 1
}

verbose=false
output=""

while getopts ":vo:" opt; do
  case "$opt" in
    v) verbose=true ;;
    o) output="$OPTARG" ;;
    :) echo "Option -$OPTARG requires an argument"; usage ;;
    \?) echo "Unknown option: -$OPTARG"; usage ;;
  esac
done
shift $((OPTIND - 1))   # remove parsed options; $@ now has positional args

[[ $# -lt 1 ]] && usage
input="$1"
```

`getopts` handles short options (`-v`, `-o val`). For long options (`--verbose`), you need `getopt` (the external command) or manual parsing.

**`shift` — consume positional args:**

```bash
while [[ $# -gt 0 ]]; do
  case "$1" in
    --verbose) verbose=true; shift ;;
    --output)  output="$2"; shift 2 ;;
    --)        shift; break ;;
    *)         break ;;
  esac
done
```

**Script best practices:**

```bash
# Fail loudly with a useful message
die() {
  echo "ERROR: $*" >&2
  exit 1
}

# Use a cleanup trap
tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT

# Log to stderr, output to stdout
log() { echo "[$(date +%T)] $*" >&2; }
```

## Watch out

- `set -e` does **not** trigger inside the condition of `if`, `while`, `until`, after `!`, or on the left side of `&&`/`||` — a failing command there is expected to potentially fail. This is why `grep -q pattern file || true` is redundant (the `if`/`&&` context already suppresses `-e`), but a bare `grep -q pattern file` as a whole *statement* under `-e` will abort the script if it doesn't match.
- `set -e` also does not fire for the non-last command in a pipeline unless `pipefail` is also set — `false | echo ok` still exits the script with status 0 without `pipefail`.
- Getting a function's exit code with `local x=$(cmd)` masks `cmd`'s exit code — `$?` after that line reflects the `local` builtin's own exit status (almost always 0), not `cmd`'s. Split the declaration and assignment: `local x; x=$(cmd)`.
- Reusing `getopts` across multiple calls in the same shell (including inside a function that's called more than once) requires resetting `OPTIND=1` first — otherwise the second call picks up parsing from where the first left off and silently misparses.

## vs other languages

| Concept | Python/Go/Node | Bash |
|---------|---------------|------|
| Argument parsing | `argparse` / `flag` / `yargs` | `getopts` (short opts) or manual `case "$1"` |
| Error on undefined var | compile error / runtime error | only with `set -u` |
| Exit on error | exceptions propagate | only with `set -e` |
| Pipeline failure | N/A | only with `set -o pipefail` |
| Cleanup on exit | `defer` / `finally` / `atexit` | `trap ... EXIT` |

The gotcha with `set -e`: it doesn't trigger inside `if` conditions, `while` conditions, or after `!`. Code like `! grep -q "x" file` works fine under `-e`.

## The task

You're writing three functions that model production-script patterns: option parsing, error-as-exit-code, and guaranteed cleanup.

**`parse_args [args...]`** — parses the flags `-v` (verbose, no argument) and `-o <output>` (takes a value), plus one required positional argument. Echoes a summary line: `verbose=<true|false> output=<value|""> input=<value>`. If the positional argument is missing after parsing options, writes `error: missing input` to **stderr** and returns exit code `1` (no stdout in that case).

```bash
parse_args "myinput"                  # verbose=false output= input=myinput
parse_args -v "data.txt"              # verbose=true output= input=data.txt
parse_args -o out.txt "src.txt"       # verbose=false output=out.txt input=src.txt
parse_args -v -o report.csv "raw.csv" # verbose=true output=report.csv input=raw.csv
parse_args                            # (stderr) error: missing input   — exit code 1
```

**`safe_divide a b`** — echoes the integer (truncating) result of `a / b`. If `b` is `0`, writes `error: division by zero` to **stderr** and returns exit code `1` instead of dividing.

```bash
safe_divide 10 2   # 5
safe_divide 7 2    # 3    — integer division truncates toward zero
safe_divide -6 3   # -2
safe_divide 5 0    # (stderr) error: division by zero   — exit code 1
```

**`with_tempfile`** — creates a temp file (`mktemp`), writes the string `hello from tempfile` to it, echoes the file's contents, and deletes the file — using `trap ... EXIT` so the file is removed even if something in between fails.

```bash
with_tempfile   # hello from tempfile
```
