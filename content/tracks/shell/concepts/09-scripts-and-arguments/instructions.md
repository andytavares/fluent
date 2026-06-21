# Scripts & Arguments

## What you'll learn

The difference between a one-liner and a production script is mostly discipline: a proper shebang, `set -euo pipefail`, and structured argument parsing with `getopts`. These three things eliminate entire categories of bugs.

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

Implement three functions:

**`parse_args [args...]`** — parses the flags `-v` (verbose), `-o <output>`, and a required positional argument. Echoes a summary line: `verbose=<true|false> output=<value|""> input=<value>`. If the positional argument is missing, echoes `error: missing input` to stderr and returns exit code 1.

**`safe_divide a b`** — echoes the integer result of `a / b`. If `b` is zero, echoes `error: division by zero` to stderr and returns exit code 1. Use `set -e` semantics internally.

**`with_tempfile`** — creates a temp file, writes the string `hello from tempfile` to it, echoes the file's content, then deletes it. Use `trap ... EXIT` for cleanup.
