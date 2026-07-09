# Process Management

## What you'll learn

Lesson 9's `trap ... EXIT` was a preview of signal handling in a single process; this lesson covers managing multiple processes at once. How Bash starts, tracks, and communicates with processes: background jobs, signals, subshells, and the `exec` system call. These are the tools for writing daemons, parallel scripts, and reliable cleanup handlers.

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

## Watch out

- `$!` captures the PID of the **most recently backgrounded** process — if you background several commands in a loop without saving each PID immediately (`pids+=($!)`), you'll only ever have the last one.
- `wait` with no argument waits for all background jobs but discards their individual exit codes — it returns the exit status of the *last* one to finish. To detect which jobs failed, `wait` each PID separately and track the results yourself.
- `kill $pid` only sends a signal — it doesn't guarantee the process has actually exited by the time `kill` returns. Follow with `wait $pid` (or poll `kill -0 $pid`) if you need to know the process is really gone before continuing.
- A `trap` set inside `()` or `$()` (a subshell) does not affect the parent shell's traps — this is normally what you want for scoped cleanup, but it also means a trap you install inside a function meant to run in the *current* shell (no subshell) will still be active after the function returns unless you reset it.

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

You're writing three functions that manage background jobs, timeouts, and cleanup traps.

**`run_parallel [commands...]`** — runs each argument as a shell command string (via `eval`) in the background, waits for all of them to finish, and echoes `all done` if every command succeeded, or `<N> failed` (where `N` is the count of non-zero exits) if any failed.

```bash
run_parallel "true" "true" "true"     # all done
run_parallel "true" "false" "false"   # 2 failed
run_parallel "exit 0"                 # all done   — a single command still counts
```

**`with_timeout seconds cmd`** — runs `cmd` (a command string, via `eval`) and kills it if it hasn't finished within `seconds` seconds. Echoes `ok` if the command finished in time, `timeout` if it had to be killed.

```bash
with_timeout 5 "true"        # ok        — finishes immediately, well under 5s
with_timeout 1 "sleep 10"    # timeout   — killed after 1s, never reaches completion
```

**`install_trap`** — runs a subshell (`bash -c '...'`) that installs an `EXIT` trap printing `cleanup ran`, then exits normally so the trap fires. Echoes whatever the subshell printed to stdout.

```bash
install_trap   # cleanup ran
```
