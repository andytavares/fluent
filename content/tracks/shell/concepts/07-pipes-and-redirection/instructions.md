# Pipes & Redirection

## What you'll learn

Bash's I/O model: every process has three standard file descriptors (stdin=0, stdout=1, stderr=2), and you can wire them together or point them at files without changing the programs themselves.

## Key concepts

**Basic redirection:**

```bash
command > file.txt      # stdout → file (overwrite)
command >> file.txt     # stdout → file (append)
command < file.txt      # file → stdin
command 2> err.txt      # stderr → file
command 2>&1            # stderr → stdout (merge)
command &> file.txt     # both stdout and stderr → file (Bash 4+)
command > /dev/null 2>&1  # discard all output
```

Order matters: `2>&1 > file` is wrong (stderr goes to the old stdout before redirect). `> file 2>&1` is correct.

**Pipes — connect stdout of one process to stdin of the next:**

```bash
ls -la | grep ".sh" | wc -l
cat access.log | sort | uniq -c | sort -rn | head -20
```

Each command in a pipeline runs in a subshell. Exit codes: `$?` gives the last command's exit code. For the full pipeline, use `${PIPESTATUS[@]}`:

```bash
cat file | grep "pattern" | wc -l
echo "${PIPESTATUS[@]}"   # e.g., "0 0 0"
```

**Here-documents — embed multi-line input:**

```bash
cat <<EOF
line one
line two with $variable expansion
EOF

cat <<'EOF'             # single-quoted — no expansion
literal $variable
no $(substitution) here
EOF

cat <<-EOF              # strip leading tabs (not spaces)
	indented content
	stays readable
EOF
```

**Here-strings — single-line here-doc:**

```bash
grep "pattern" <<< "string to search"
read -r first rest <<< "one two three"   # first="one", rest="two three"
```

**Process substitution — treat command output as a file:**

```bash
diff <(sort file1.txt) <(sort file2.txt)
while IFS= read -r line; do
  echo "$line"
done < <(find . -name "*.sh")
```

`<(cmd)` creates a named pipe (or `/dev/fd/N`) that looks like a filename. This lets you pass command output to commands that expect files, or use it with `while read` without the subshell problem.

**The subshell pitfall with pipes:**

```bash
# Wrong — count is modified inside a subshell, change is lost
count=0
cat file | while read line; do ((count++)); done
echo $count   # still 0

# Right — use process substitution
count=0
while IFS= read -r line; do ((count++)); done < <(cat file)
echo $count   # correct
```

## vs other languages

| Concept | Other languages | Bash |
|---------|----------------|------|
| Pipe | Language-level streams | OS-level, between processes |
| Capture output | `subprocess.run(..., capture_output=True)` | `output=$(cmd)` |
| Stderr | Language exception objects | fd 2, redirected with `2>` or `2>&1` |
| Here-doc | Python `"""`, JS template literals | `<<EOF ... EOF` |
| Treat output as file | Temp file manually | `<(cmd)` process substitution |

## The task

Implement three functions:

**`count_matching pattern file`** — echoes the number of lines in `file` matching `pattern`. Do not use `grep -c` directly — pipe `grep` output to `wc -l`.

**`merge_streams cmd`** — runs the given command string (via `eval`), captures both stdout and stderr merged together, and echoes the combined output. Use `&>` or `2>&1` redirection with command substitution.

**`top_n_words n`** — reads stdin, splits into words, and echoes the `n` most frequent words with their counts, in descending order. Format: `<count> <word>` per line. Use a pipeline of `tr`, `sort`, `uniq -c`, `sort -rn`, `head`.
