## What you build

You write three string functions: `greet`, `describe_file` and `repeat_word`. They use assignment, quoting and parameter expansion, the rules that trip up most newcomers to Bash.

## Key concepts

### Assignment has no spaces around `=`

Bash reads `name = "Alice"` as a command named `name` with the arguments `=` and `Alice`. A value with no spaces needs no quotes.

```bash
name="Alice"
count=42
path=/usr/local/bin
```

### Every value is a string

Bash has no int, string or bool types. Arithmetic needs `$(( ))`. To join strings, put them next to each other.

```bash
count=$(( 3 + 4 ))   # 7
full="${first}${last}"
```

### `${var}` marks where the name ends

`$var` and `${var}` expand the same way. Use the braces when text follows the name. Always put double quotes around an expansion.

```bash
echo $name           # Alice
echo ${name}s        # Alices
echo "${name} wins"  # Alice wins
```

### Double quotes expand, single quotes do not

Inside double quotes, Bash expands variables. Inside single quotes, Bash keeps every character as it is.

```bash
# Hello, Alice
greeting="Hello, $name"
# Hello, $name
literal='Hello, $name'
```

### `$()` captures the output of a command

Command substitution runs a command and gives its output as a string. Backticks do the same, but they do not nest cleanly. Always use `$()`.

```bash
today=$(date +%Y-%m-%d)
files=$(ls -1 | wc -l)
echo "Today is $today, $files files"
```

### Special variables hold shell state

Bash sets these variables for you.

```bash
$?   # exit code of the last command
     # (0 = success)
$$   # PID of the current shell
$0   # name of the script
$#   # number of arguments
$@   # all arguments, as separate words
```

### Parameter expansion changes a value

These forms read a variable and change the result. An unset variable acts as null. `${var:-}` gives an empty string and avoids an "unbound variable" error.

```bash
# "default" if var is unset or empty
${var:-default}
# the same, and also assigns it to var
${var:=default}
${#var}         # length of the value
${var^^}        # uppercase (Bash 4+)
${var,,}        # lowercase (Bash 4+)
${var#prefix}   # strip shortest prefix
${var##prefix}  # strip longest prefix
${var%suffix}   # strip shortest suffix
${var%%suffix}  # strip longest suffix
```

## Watch out

- An unquoted expansion is the most common shell bug. `ls $path` splits `/tmp/my dir` into two arguments. Write `"$path"`.
- The same rule applies to `$@` in a function body. Write `"$@"`.
- `$var` stops at the first character that cannot be part of a name. `"$names_backup"` reads the variable `names_backup`.
- To follow a variable with name characters, use braces: `${names}_backup`.
- `count="3" + "4"` does not add. Bash runs a command named `+` with `count=3` in its environment.
- `${var:-default}` does not assign to `var`. Only `${var:=default}` assigns, so later reads see the default.

## The task

You write three string functions. Each one reads its arguments as `$1`, `$2` and prints its result with `echo`.

1. `greet name` prints `Hello, <name>!`.
2. `describe_file path` prints `File: <basename> (ext: <extension>)`.
3. The basename is the text after the last `/`. The extension is the text after the last `.`.
4. In `describe_file`, use parameter expansion only. Do not use the `basename` or `dirname` commands.
5. `repeat_word word n` prints `word` `n` times on one line, with one space between copies.

An empty name gives `Hello, !`. When `n` is 0, `repeat_word` prints nothing or an empty line.

```bash
greet "Alice"      # Hello, Alice!
greet "Bob Smith"  # Hello, Bob Smith!
greet ""           # Hello, !

describe_file "/tmp/report.txt"
# File: report.txt (ext: txt)
describe_file \
  "/home/user/scripts/deploy.sh"
# File: deploy.sh (ext: sh)
describe_file \
  "/var/backup/archive.tar.gz"
# File: archive.tar.gz (ext: gz)

repeat_word "hi" 3  # hi hi hi
repeat_word "go" 1  # go
repeat_word "go" 0  # (empty)
```
