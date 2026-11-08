## What you build

You write `count_matching`, `merge_streams` and `top_n_words`. They join commands with pipes and send streams to new places. This lesson builds on **Text Processing**.

## Key concepts

### Every process has three standard streams

They are file descriptors: stdin is 0, stdout is 1 and stderr is 2. Bash connects them to files or to other processes, with no change to the programs. Other languages have streams inside the language; a Bash pipe connects processes in the OS.

### Redirection points a stream at a file

`2>&1` sends stderr to the place stdout goes now. `&>` sends both streams to one file.

```bash
# stdout to a file (overwrite)
command > file.txt
# stdout to a file (append)
command >> file.txt
# A file to stdin
command < file.txt
# stderr to a file
command 2> err.txt
# stderr to stdout (merge)
command 2>&1
# stdout and stderr to a file
command &> file.txt
# Discard all output
command > /dev/null 2>&1
```

### A pipe connects stdout to the next stdin

Each command in a pipeline runs in a subshell. `$?` is the exit code of the last command. `${PIPESTATUS[@]}` holds the exit code of every stage.

```bash
ls -la | grep ".sh" | wc -l

cat file | grep "pattern" | wc -l
# For example "0 0 0"
echo "${PIPESTATUS[@]}"
```

### `$()` captures output as a string

`output=$(cmd)` stores the stdout of `cmd`. Python needs `subprocess.run(..., capture_output=True)` for the same result. Add `2>&1` inside to capture stderr too.

```bash
output=$(cmd 2>&1)
```

### A here-document gives several lines as stdin

`<<EOF` expands variables and command substitutions. `<<'EOF'` expands nothing. `<<-EOF` strips leading tabs, not spaces.

```bash
cat <<EOF
line one
line two with $variable expansion
EOF

cat <<'EOF'
literal $variable
no $(substitution) here
EOF

cat <<-EOF
	indented content
	stays readable
EOF
```

### A here-string gives one string as stdin

```bash
grep "pattern" <<< "string to search"
# first="one", rest="two three"
read -r first rest <<< "one two three"
```

### Process substitution makes output look like a file

`<(cmd)` gives a name such as `/dev/fd/63`. You can pass it to a command that expects a file. It replaces a temporary file you create by hand.

```bash
diff <(sort file1.txt) <(sort file2.txt)

while IFS= read -r line; do
  echo "$line"
done < <(find . -name "*.sh")
```

### A loop after a pipe runs in a subshell

The loop changes its own copy of each variable. Feed the loop with `< <(cmd)` so it runs in the current shell.

```bash
# Wrong: the change is lost
count=0
cat file | while read line; do
  ((count++))
done
# Still 0
echo $count

# Right: process substitution
count=0
while IFS= read -r line; do
  ((count++))
done < <(cat file)
# The real count
echo $count
```

## Watch out

- `$?` holds only the exit code of the last command in a pipeline.
- `false | true` exits 0. Check `${PIPESTATUS[@]}`, or set `pipefail`, to see the failure.
- `cmd | while read line; do ...; done` loses every variable the loop sets.
- Use `< <(cmd)` when the loop must change the state of the shell.
- `command 2>&1 > file` sends stderr to the old stdout, usually the terminal.
- Write `command > file 2>&1`: first stdout, then stderr.
- `<<EOF` expands `$` in the body. Quote the delimiter, `<<'EOF'`, for literal text such as SQL.

## The task

Write three functions that build pipelines and redirect streams.

1. `count_matching pattern file` prints the number of lines in `file` that match `pattern`.
2. Do not use `grep -c`. Pipe `grep` to `wc -l`.
3. Remove the leading spaces from the `wc -l` output before you print it.
4. No match prints `0`. It is not an error.
5. `merge_streams cmd` runs the command string `cmd` with `eval`.
6. It prints stdout and stderr together as one stream: `output=$(eval "$cmd" 2>&1)`.
7. `top_n_words n` reads stdin and prints the `n` most frequent words, most frequent first.
8. Each line is `<count> <word>`. Words are lowercase.
9. Build a pipeline: `tr` non-letters to newlines, `tr` to lowercase, `sort`, `uniq -c`, `sort -rn`, `head -n`.

```bash
printf "error: disk full\ninfo: ok\n\
error: timeout\nwarn: slow\n" > "$f"
count_matching "error" "$f"   # 2
count_matching "info" "$f"    # 1
count_matching "fatal" "$f"   # 0

merge_streams \
  "echo stdout_line; echo stderr_line >&2"
# stdout_line
# stderr_line

echo "the cat sat on the mat the cat" \
  | top_n_words 2
# 3 the
# 2 cat
```
