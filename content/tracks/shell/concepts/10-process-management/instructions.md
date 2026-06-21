# Process Management

## What you'll learn

How Bash starts, tracks, and communicates with processes: background jobs, signals, subshells, and the `exec` system call. These are the tools for writing daemons, parallel scripts, and reliable cleanup handlers.

## Key concepts

**Background jobs — `&`, `wait`, `jobs`:**

```bash
long_task &            # run in background; shell continues immediately
pid=$!                 # capture PID of last background process

another_task &
pid2=$!

wait $pid              # wait for specific PID, capture its exit code
wait                   # wait for ALL background jobs

jobs                   # list background jobs in current shell
jobs -l                # include PIDs
```

**`wait` and exit codes:**

```bash
process_file "$f" &
pids+=($!)

# ... start more ...

failed=0
for pid in "${pids[@]}"; do
  wait "$pid" || ((failed++))
done
```

**Signals and `trap`:**

```bash
trap 'echo "caught SIGINT"' INT
trap 'cleanup; exit 0' EXIT TERM
trap '' HUP               # ignore SIGHUP (for daemon-style scripts)

kill -TERM $pid           # send SIGTERM (graceful shutdown request)
kill -KILL $pid           # send SIGKILL (immediate, uncatchable)
kill -0 $pid              # check if process exists (no signal sent)
```

Signal names: `INT` (Ctrl-C), `TERM` (default kill), `HUP` (terminal close), `KILL` (force), `EXIT` (pseudo-signal, always fires on exit).

**Subshells — `()`:**

```bash
(
  cd /tmp
  rm -f *.tmp
  echo "cleaned up"
)
# cwd unchanged here; changes inside () don't leak out

result=$(subshell command)   # $() is also a subshell
```

Variables set inside `()` don't affect the parent shell. Useful for temporary directory changes, temporary variable overrides, or grouping redirections.

**`exec` — replace the current process:**

```bash
exec python3 app.py          # replace shell with Python — no return
exec > logfile.txt           # redirect all subsequent stdout to file
exec 3< input.txt            # open file descriptor 3 for reading
read -r line <&3             # read from fd 3
exec 3<&-                    # close fd 3
```

**`nohup` — survive terminal close:**

```bash
nohup long_running_script.sh > output.log 2>&1 &
disown $!     # detach from shell's job table (Bash-specific)
```

## vs other languages

| Concept | Python | Bash |
|---------|--------|------|
| Spawn process | `subprocess.Popen()` | `cmd &` |
| Get PID | `.pid` attribute | `$!` after `&` |
| Wait for process | `.wait()` | `wait $pid` |
| Signal handling | `signal.signal()` | `trap 'handler' SIGNAME` |
| Replace process | `os.execvp()` | `exec cmd` |
| Subshell env | `multiprocessing` | `( ... )` |

The key difference from Python's `subprocess`: Bash background jobs share the same terminal and file descriptors by default. You often need to redirect their output explicitly to avoid interleaving with the parent's output.

## The task

Implement three functions:

**`run_parallel [commands...]`** — runs each argument as a shell command in the background, waits for all to finish, and echoes `all done` if all succeeded or `N failed` (where N is the count) if any failed. Each command is a single string passed to `eval`.

**`with_timeout seconds cmd`** — runs `cmd` (as a string via `eval`) and kills it if it hasn't finished within `seconds` seconds. Echoes `ok` if the command finished in time, `timeout` if it was killed.

**`install_trap`** — installs an EXIT trap that echoes `cleanup ran` to stdout, then immediately exits the subshell (use a subshell with `bash -c` so the trap fires and the rest of the script isn't affected). Echoes whatever the subshell printed.
