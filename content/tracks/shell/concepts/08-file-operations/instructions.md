# File Operations

## What you'll learn

The Unix file utilities — `find`, `xargs`, `stat`, `chmod`, `cp`, `rsync` — and how to compose them safely in scripts. The key skill is knowing when to use `-exec` vs `xargs` and how to handle filenames with spaces.

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

Implement three functions:

**`find_by_extension dir ext`** — echoes all files under `dir` with the given extension (without dot), one per line, sorted. Use `find`.

**`make_executable dir`** — makes all `.sh` files under `dir` executable (`chmod +x`). Use `find -exec` or `find ... | xargs`.

**`ensure_dir path`** — creates the directory at `path` (and any parents) if it doesn't exist, then echoes `created` if it was created or `exists` if it was already there.
