## What you build

You write `parse_args`, `safe_divide` and `with_tempfile`. They model option parsing, errors as exit codes and cleanup that always runs. This lesson builds on **File Operations**.

## Key concepts

### The shebang finds `bash` on the `PATH`

Write `/usr/bin/env bash`, not `/bin/bash`. On macOS, NixOS and in containers, the `bash` you want can live in another directory. `env` runs the first `bash` on the `PATH`.

```bash
#!/usr/bin/env bash
```

### `set -euo pipefail` stops a script on errors

Without `-e`, a script continues past a failed command. Without `-u`, a mistyped variable name expands to an empty string. Without `pipefail`, `false | echo "still running"` exits 0.

```bash
# Exit when a command fails
set -e
# Treat unset variables as errors
set -u
# A pipeline fails if any stage fails
set -o pipefail

# All three, the usual form
set -euo pipefail
```

### `getopts` parses short options

`getopts` reads options such as `-v` and `-o val`. A `:` after a letter means the option takes a value, in `$OPTARG`. After the loop, `shift $((OPTIND - 1))` leaves only the positional arguments in `$@`.

```bash
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
    :) echo "-$OPTARG needs a value"
       usage ;;
    \?) echo "Unknown option: -$OPTARG"
        usage ;;
  esac
done
shift $((OPTIND - 1))

[[ $# -lt 1 ]] && usage
input="$1"
```

### Long options need a manual loop

`getopts` does not read long options such as `--verbose`. Use the external `getopt` command, or loop with `shift`. Python has `argparse` and Go has `flag`; Bash has only these.

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

### `trap ... EXIT` does the cleanup

A trap on `EXIT` runs when the script ends, for any reason. It does the work of `defer` or `finally` in other languages. Send errors and logs to stderr, and keep stdout for output.

```bash
die() {
  echo "ERROR: $*" >&2
  exit 1
}

tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT

log() { echo "[$(date +%T)] $*" >&2; }
```

## Watch out

- `set -e` ignores a failure in an `if`, `while` or `until` condition.
- It also ignores a failure after `!`, and on the left of `&&` or `||`.
- So `grep -q x file || true` continues when `grep` fails. A bare `grep -q x file` stops the script.
- Without `pipefail`, a pipeline has the exit code of its last command.
- So `false | echo ok` exits 0, and `set -e` does not stop the script.
- `local x=$(cmd)` hides the exit code of `cmd`. `$?` then holds the code of `local`, almost always 0.
- Write `local x; x=$(cmd)` on two statements.
- A second `getopts` loop in the same shell continues from the old `OPTIND`.
- Set `OPTIND=1` before you parse again, for example in a function called twice.

## The task

Write three functions in the style of a production script.

1. `parse_args arg...` reads the flag `-v`, the option `-o <output>` and one positional input.
2. It prints `verbose=<true|false> output=<value> input=<value>`.
3. With no `-o`, the output value is empty: `output=`.
4. With no positional input, it writes `error: missing input` to stderr.
5. In that case, it returns exit code 1 and prints nothing to stdout.
6. `safe_divide a b` prints the integer result of `a / b`. Bash division truncates toward zero.
7. When `b` is 0, it writes `error: division by zero` to stderr and returns exit code 1.
8. `with_tempfile` creates a file with `mktemp` and writes `hello from tempfile` to it.
9. It prints the content of the file.
10. It deletes the file with `trap ... EXIT`, so the file goes even after a failure.

```bash
parse_args myfile
# verbose=false output= input=myfile
parse_args -v data.txt
# verbose=true output= input=data.txt
parse_args -o out.txt src.txt
# verbose=false output=out.txt input=src.txt
parse_args -v -o report.csv raw.csv
# verbose=true output=report.csv input=raw.csv
parse_args
# stderr: error: missing input
# exit code 1

safe_divide 10 2   # 5
safe_divide 7 2    # 3
safe_divide -6 3   # -2
safe_divide 5 0
# stderr: error: division by zero
# exit code 1

with_tempfile   # hello from tempfile
```
