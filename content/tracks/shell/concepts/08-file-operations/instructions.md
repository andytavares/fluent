## What you build

You write `find_by_extension`, `make_executable` and `ensure_dir` with `find`, `chmod` and `mkdir`. You also learn when to use `-exec` or `xargs`, and how to handle file names with spaces. This lesson builds on **Pipes & Redirection**.

## Key concepts

### `find` searches the file system

`find` walks a directory tree, like `os.walk()` in Python. Tests such as `-name`, `-type`, `-mtime` and `-size` select the results.

```bash
# By name pattern
find . -name "*.sh"
# Regular files only
find . -type f -name "*.log"
# Directories only
find . -type d -name "node_modules"
# Changed in the last 7 days
find . -mtime -7
# Larger than 1 MB
find . -size +1M
# Delete in one pass
find . -name "*.tmp" -delete
```

### `-exec` runs a command on the results

`-exec cmd {} \;` runs `cmd` once for each file. `-exec cmd {} +` gives many files to each run of `cmd`, so it is faster on large trees.

```bash
# One chmod for each file
find . -name "*.sh" -exec chmod +x {} \;
# Batched
find . -name "*.log" -exec rm {} +
```

### `xargs` builds commands from stdin

Pair `find -print0` with `xargs -0` when file names can contain spaces or newlines. This is the safe default.

```bash
# Simple case
find . -name "*.log" | xargs rm
# Safe with spaces in names
find . -name "*.log" -print0 \
  | xargs -0 rm
find . -name "*.sh" -print0 \
  | xargs -0 chmod +x
# One argument for each run
echo "a b c" | xargs -n1 echo
```

### `stat` shows file metadata

The output format and the flags change between systems.

```bash
# Full output
stat file.txt
# Size in bytes (GNU)
stat -c "%s" file.txt
# Size in bytes (BSD/macOS)
stat -f "%z" file.txt
```

### `chmod` and `chown` set permissions and owners

```bash
# rwxr-xr-x
chmod 755 script.sh
# Add execute for all
chmod +x script.sh
# User adds write, group loses write
chmod u+w,g-w file.txt
# Change owner and group
chown user:group file.txt
```

### `mkdir -p`, `cp` and `rsync` create and copy trees

```bash
# Create the path; no error if it exists
mkdir -p /path/that/may/not/exist
# Recursive copy
cp -r src/ dest/
# Archive: keeps permissions and timestamps
cp -a src/ dest/
# Sync and keep metadata
rsync -av src/ dest/
# Mirror: delete files not in src
rsync -av --delete src/ dest/
# Sync to a remote host over SSH
rsync -av src/ user@host:/remote/path/
```

## Watch out

- `find . -name "*.log" | xargs rm` fails on names with spaces or newlines.
- `xargs` splits its input on whitespace. Use `find -print0` with `xargs -0` for names you do not control.
- `-exec cmd {} \;` runs `cmd` once for each file, which is slow on large trees.
- `-exec cmd {} +` is not always a drop-in change. Some commands act differently with many arguments.
- `mkdir somedir` fails if `somedir` exists or a parent is missing.
- `mkdir -p` does not fail in either case. Use `-p` by default in scripts.
- `stat -c "%s"` works on GNU (Linux) but fails on BSD (macOS), which uses `-f`.
- To test only if a file is not empty, use `[[ -s file ]]`, not `stat`.

## The task

Write three functions with `find`, `chmod` and `mkdir`.

1. `find_by_extension dir ext` prints every regular file under `dir`, at any depth, whose name ends in `.<ext>`.
2. `ext` has no leading dot.
3. It prints one path per line, sorted. Use `find ... | sort`.
4. `make_executable dir` adds the execute bit to every `.sh` file under `dir`, at any depth.
5. It does not change files with other extensions.
6. Use one batched `find -exec ... +`, not one `chmod` for each file.
7. `ensure_dir path` creates the directory `path` and any missing parents.
8. It prints `created` if it made the directory, or `exists` if the directory was already there.
9. A second call on the same path does not fail.

```bash
dir=$(mktemp -d)
touch "$dir/a.sh" "$dir/b.sh" \
  "$dir/c.txt" "$dir/d.sh"

find_by_extension "$dir" "sh"
# .../a.sh
# .../b.sh
# .../d.sh
find_by_extension "$dir" "txt"
# .../c.txt

make_executable "$dir"
# a.sh, b.sh and d.sh are executable
# c.txt is not

ensure_dir "$dir/new/nested"   # created
ensure_dir "$dir/new/nested"   # exists
ensure_dir "$dir"              # exists
```
