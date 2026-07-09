# File Operations

## What you'll learn

You've been redirecting and piping data between commands; now you'll operate on the filesystem itself. The Unix file utilities — `find`, `xargs`, `stat`, `chmod`, `cp`, `rsync` — and how to compose them safely in scripts. The key skill is knowing when to use `-exec` vs `xargs` and how to handle filenames with spaces (the same word-splitting hazard from earlier lessons, now applied to paths).

## Key concepts

**`find` — the right tool for filesystem searches:**

```bash
find . -name "*.sh"                    # by name pattern
find . -type f -name "*.log"           # regular files only
find . -type d -name "node_modules"    # directories only
find . -mtime -7                       # modified within 7 days
find . -size +1M                       # larger than 1 MB
find . -name "*.tmp" -delete           # delete in one pass

# Execute a command on each result
find . -name "*.sh" -exec chmod +x {} \;   # one invocation per file
find . -name "*.log" -exec rm {} +         # batched (more efficient)
```

**`xargs` — build and execute commands from stdin:**

```bash
find . -name "*.log" | xargs rm                  # simple case
find . -name "*.log" -print0 | xargs -0 rm       # safe with spaces in names
find . -name "*.sh"  -print0 | xargs -0 chmod +x
echo "a b c" | xargs -n1 echo                    # one arg per invocation
```

Always pair `-print0` with `-0` when filenames might contain spaces or newlines. This is the safe default.

**`stat` — file metadata:**

```bash
stat file.txt                          # full output (format varies by OS)
stat -c "%s" file.txt                  # file size in bytes (GNU)
stat -f "%z" file.txt                  # file size in bytes (BSD/macOS)
```

**`chmod`/`chown` — permissions:**

```bash
chmod 755 script.sh           # rwxr-xr-x
chmod +x script.sh            # add execute for all
chmod u+w,g-w file.txt        # symbolic: user +write, group -write
chown user:group file.txt     # change owner and group
```

**`mkdir -p` / `cp -r` / `rsync`:**

```bash
mkdir -p /path/that/may/not/exist        # create entire path, no error if exists
cp -r src/ dest/                         # recursive copy
cp -a src/ dest/                         # archive: preserves permissions, timestamps
rsync -av src/ dest/                     # sync with progress, preserves metadata
rsync -av --delete src/ dest/            # mirror: delete files not in src
rsync -av src/ user@host:/remote/path/  # remote sync over SSH
```

## Watch out

- `find . -name "*.log" | xargs rm` breaks on filenames containing spaces or newlines — each line gets word-split by `xargs`'s default delimiter. Pair `find -print0` with `xargs -0` whenever filenames aren't guaranteed to be simple.
- `find ... -exec cmd {} \;` runs `cmd` once **per file** (slow for large trees); `find ... -exec cmd {} +` batches many files into fewer invocations, much closer to how `xargs` behaves. They are not interchangeable if `cmd` behaves differently when given multiple arguments (e.g. `echo` vs `rm`).
- `mkdir somedir` fails if `somedir` already exists or if a parent is missing; `mkdir -p` does neither — silently succeeds if the directory is already there and creates missing parents. Reach for `-p` by default in scripts.
- `stat`'s format flags differ between GNU (Linux, `-c`) and BSD (macOS, `-f`) — a `stat -c "%s" file` script that works in CI may fail on a contributor's Mac. Check with `[[ -s file ]]` for "non-empty" instead of parsing `stat` output when you only need a boolean.

## vs other languages

| Task | Python | Bash |
|------|--------|------|
| Walk directory tree | `os.walk()` | `find . -type f` |
| Recursive copy | `shutil.copytree()` | `cp -r` or `rsync -a` |
| File metadata | `os.stat()` | `stat` |
| Permissions | `os.chmod()` | `chmod` |
| Safe filenames | escape manually | `-print0 \| xargs -0` |

`find -exec {} +` batches multiple files into one invocation (like `xargs`), while `-exec {} \;` calls once per file. The `+` form is almost always faster for large trees.

## The task

You're writing three functions built on `find`, `chmod`, and `mkdir`.

**`find_by_extension dir ext`** — echoes all **regular files** under `dir` (recursively) whose name ends in `.<ext>` (`ext` has no leading dot), one path per line, sorted. Use `find ... | sort`.

```bash
# dir contains a.sh, b.sh, c.txt, d.sh
find_by_extension "$dir" "sh"
# .../a.sh
# .../b.sh
# .../d.sh

find_by_extension "$dir" "txt"
# .../c.txt
```

**`make_executable dir`** — makes every `.sh` file under `dir` (recursively) executable (`chmod +x`); files with other extensions are left untouched. Use `find -exec ... +` (batched) rather than one `chmod` call per file.

```bash
make_executable "$dir"   # every *.sh under $dir gains the execute bit; *.txt is unaffected
```

**`ensure_dir path`** — creates the directory at `path`, including any missing parent directories, if it doesn't already exist. Echoes `created` if it made the directory, or `exists` if the directory was already there. Never errors if called twice in a row on the same path.

```bash
ensure_dir "/tmp/work/nested"   # created  — didn't exist, now does (parents included)
ensure_dir "/tmp/work/nested"   # exists   — second call finds it already there
ensure_dir "/tmp"               # exists   — pre-existing directory
```
