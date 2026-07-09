# Pipes & Redirection

## What you'll learn

Lesson 6's `grep`/`sed`/`awk` pipeline (`cmd1 | cmd2 | cmd3`) was your first taste of pipes; this lesson covers the full I/O model behind it. Bash gives every process three standard file descriptors (stdin=0, stdout=1, stderr=2), and you can wire them together or point them at files without changing the programs themselves.

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

## Watch out

- `$?` only reflects the **last** command in a pipeline. `false | true` exits 0 — the failure is invisible unless you check `${PIPESTATUS[@]}` or set `pipefail`.
- `command1 | while read line; do count=$((count+1)); done; echo $count` almost always prints the value from **before** the loop, because the `while` runs in a subshell when its stdin comes from a pipe — variables it sets don't survive past the pipe. Use process substitution (`< <(command1)`) instead of a pipe when the loop body needs to affect the calling shell's state.
- Redirection order matters: `command 2>&1 > file` sends stderr to wherever stdout was pointing *before* the redirect (usually the terminal), not to `file`. Write `command > file 2>&1` — redirect stdout first, then point stderr at stdout's new target.
- Bare here-docs (`<<EOF`) expand variables and command substitutions inside the body; quoting the delimiter (`<<'EOF'`) disables all expansion, which is what you want for literal text like example scripts or SQL containing `$`.

## vs other languages

| Concept | Other languages | Bash |
|---------|----------------|------|
| Pipe | Language-level streams | OS-level, between processes |
| Capture output | `subprocess.run(..., capture_output=True)` | `output=$(cmd)` |
| Stderr | Language exception objects | fd 2, redirected with `2>` or `2>&1` |
| Here-doc | Python `"""`, JS template literals | `<<EOF ... EOF` |
| Treat output as file | Temp file manually | `<(cmd)` process substitution |

## The task

You're writing three functions that compose pipelines and handle stream redirection.

**`count_matching pattern file`** — echoes the number of lines in `file` matching `pattern`. Do not use `grep -c` directly — pipe `grep` output to `wc -l` (and trim `wc -l`'s leading whitespace before echoing).

```bash
# file contains: error: disk full / info: ok / error: timeout / warn: slow
count_matching "error" "$file"    # 2
count_matching "info"  "$file"    # 1
count_matching "fatal" "$file"    # 0   — no match is not an error, just a count of 0
```

**`merge_streams cmd`** — runs `cmd` (a command string, via `eval`), captures both stdout and stderr **merged into one stream**, and echoes the combined output. Use `2>&1` redirection with command substitution: `output=$(eval "$cmd" 2>&1)`.

```bash
merge_streams "echo hello; echo world >&2"
# hello
# world
```

**`top_n_words n`** — reads stdin, splits it into (lowercased) words, and echoes the `n` most frequent words with their counts, most frequent first. Format each line as `<count> <word>`. Build it as a pipeline: split non-letters into newlines (`tr`), lowercase (`tr`), `sort`, `uniq -c`, `sort -rn`, `head -n`.

```bash
echo "the cat sat on the mat the cat" | top_n_words 2
# 3 the
# 2 cat
```
