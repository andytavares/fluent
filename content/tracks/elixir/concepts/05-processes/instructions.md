## What you build

You write a `Messenger` module: a small echo service built on `spawn`, `send` and `receive`. All of OTP builds on BEAM processes. This lesson builds on **Maps & Structs**.

## Key concepts

### A process is a lightweight actor

A BEAM process is not an OS thread or an async task. Each process has its own heap and talks to other processes only by messages. A crash in one process does not affect the others.

### `spawn/1` starts a process

`spawn/1` takes a function with no arguments and runs it in a new process. It returns a PID at once. The process exits when the function returns.

```elixir
pid = spawn(fn ->
  IO.puts("I run concurrently")
end)
```

### `send/2` and `receive` pass messages

`send/2` does not block. It always succeeds, even when the target process is dead. `receive` blocks until a message that matches one of its patterns arrives.

```elixir
pid = spawn(fn ->
  receive do
    {:hello, sender} ->
      send(sender, {:reply, "world"})
  end
end)

send(pid, {:hello, self()})

receive do
  {:reply, msg} -> IO.puts("Got: #{msg}")
end
```

### Each process has one mailbox

Messages wait in the mailbox in arrival order. `receive` takes the first message that matches a pattern. A message that matches no pattern stays in the mailbox. A Go program selects by channel; an Elixir process selects by pattern.

### `after` sets a timeout

The `after` clause runs when no matching message arrives in time. The time is in milliseconds.

```elixir
receive do
  {:pong} -> :ok
after
  1000 -> {:error, :timeout}
end
```

### `self/0` returns the current PID

```elixir
# The PID of the current process
self()  # => #PID<0.123.0>
Process.alive?(pid)  # => true or false
```

### `spawn_link/1` links two processes

With `spawn/1`, a crash in the new process does not reach the caller. With `spawn_link/1`, the exit signal reaches the caller and kills it, unless the caller traps exits.

```elixir
# The caller does not see the crash
spawn(fn -> raise "boom" end)

# The crash kills the caller too
spawn_link(fn -> raise "boom" end)
```

### OTP manages processes for you

Production code rarely uses raw `spawn`. A `GenServer` manages the process lifecycle. `spawn`, `send` and `receive` are what a `GenServer` does inside.

## Watch out

- A process that does not call itself again exits after one message.
- A one-shot `receive` answers the first `ask/2`. The second `ask/2` then times out.
- `send/2` to a dead PID does nothing and returns no error. Use the `after` clause to detect it.

## The task

Write three functions in the `Messenger` module. Together they form a request/reply echo service.

1. `echo_server()` spawns a process and returns its PID.
2. The process loops and waits for `{:echo, sender, msg}` messages.
3. For each one, it sends `{:echo_reply, msg}` to `sender` and loops again.
4. When the process receives the atom `:stop`, the loop ends and the process exits.
5. `ask(pid, msg)` sends `{:echo, self(), msg}` to `pid`.
6. `ask/2` then waits in `receive` for `{:echo_reply, reply}` and returns `reply`.
7. When no reply arrives in 1000 ms, `ask/2` returns `{:error, :timeout}`.
8. `stop(pid)` sends `:stop` to `pid`.

The same server answers many `ask/2` calls in sequence. An `ask/2` to a stopped server returns `{:error, :timeout}`.

```elixir
pid = Messenger.echo_server()
is_pid(pid)                  # => true
Messenger.ask(pid, "hello")  # => "hello"
Messenger.ask(pid, "ping")   # => "ping"
Messenger.ask(pid, "first")  # => "first"
Messenger.ask(pid, "second") # => "second"

Messenger.stop(pid)
Process.sleep(50)
Process.alive?(pid)          # => false
Messenger.ask(pid, "hello")
# => {:error, :timeout}
```
