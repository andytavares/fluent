## What you build

You write `run_parallel`, `with_timeout` and `install_trap`. They start background jobs, send signals and run cleanup traps. This lesson builds on **Scripts & Arguments**.

## Key concepts

### `&` starts a background job

The shell continues at once. `$!` holds the PID of the last background job. Background jobs share the terminal and file descriptors of the shell, so redirect their output to keep it apart.

```bash
long_task &
pid=$!

another_task &
pid2=$!

# List background jobs; -l adds PIDs
jobs
jobs -l
```

### `wait` collects the exit code of a job

`wait $pid` waits for one job and returns its exit code. `wait` with no argument waits for all jobs. Python uses `subprocess.Popen()` and `.wait()` for the same work.

```bash
pids=()
for f in "${files[@]}"; do
  process_file "$f" &
  pids+=($!)
done

failed=0
for pid in "${pids[@]}"; do
  wait "$pid" || ((failed++))
done
```

### `trap` runs code when a signal arrives

`INT` comes from Ctrl-C. `TERM` is the default of `kill`. `HUP` comes when the terminal closes. `KILL` forces an exit and no trap can catch it. `EXIT` is a pseudo-signal that fires whenever the shell exits.

```bash
trap 'echo "caught SIGINT"' INT
trap 'cleanup; exit 0' EXIT TERM
# Ignore SIGHUP, for daemon-style scripts
trap '' HUP
```

### `kill` sends a signal

```bash
# Ask the process to stop
kill -TERM $pid
# Stop it at once; it cannot catch this
kill -KILL $pid
# Test if it exists; sends no signal
kill -0 $pid
```

### `( )` runs commands in a subshell

Changes inside `( )` do not reach the parent shell: variables, the working directory and redirections. `$()` is a subshell too.

```bash
(
  cd /tmp
  rm -f *.tmp
  echo "cleaned up"
)
# The working directory is unchanged here
```

### `exec` replaces the shell or opens file descriptors

`exec cmd` replaces the shell with `cmd` and does not return. With only redirections, `exec` changes them for the rest of the script.

```bash
# Replace the shell with Python
exec python3 app.py
# Send all later stdout to a file
exec > logfile.txt
# Open descriptor 3, read from it, close it
exec 3< input.txt
read -r line <&3
exec 3<&-
```

### `nohup` keeps a job alive after the terminal closes

`disown` removes a job from the job table of the shell. It is Bash only.

```bash
nohup long_running_script.sh \
  > output.log 2>&1 &
disown $!
```

## Watch out

- `$!` holds only the most recent background PID.
- In a loop, save each PID at once with `pids+=($!)`. If not, you keep only the last one.
- `wait` with no argument returns 0. It does not report which jobs failed.
- To find the failed jobs, `wait` each PID on its own.
- `kill $pid` only sends a signal. The process can still run when `kill` returns.
- Follow with `wait $pid`, or poll `kill -0 $pid`, to know it has stopped.
- A `trap` set in `( )` or `$()` does not change the traps of the parent shell.
- A `trap` set in a function that runs in the current shell stays active after it returns.

## The task

Write three functions that manage background jobs, timeouts and cleanup traps.

1. `run_parallel command...` runs each argument as a command string with `eval`, in the background.
2. It waits for all of them to finish.
3. If every command exits 0, it prints `all done`.
4. If not, it prints `<N> failed`, where `N` is the count of non-zero exits.
5. `with_timeout seconds cmd` runs the command string `cmd` with `eval`.
6. If `cmd` ends within `seconds` seconds, it prints `ok`.
7. If not, it kills `cmd` and prints `timeout`.
8. `install_trap` runs `bash -c '...'` with an `EXIT` trap that prints `cleanup ran`.
9. The `bash -c` script exits normally, so the trap fires. `install_trap` prints its stdout.

A single command still counts for `run_parallel`.

```bash
run_parallel "true" "true" "true"
# all done
run_parallel "true" "false" "false"
# 2 failed
run_parallel "exit 0"
# all done

with_timeout 5 "true"       # ok
with_timeout 1 "sleep 10"   # timeout

install_trap   # cleanup ran
```
