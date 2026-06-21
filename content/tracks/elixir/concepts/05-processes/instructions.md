# Processes

## What you'll learn

Elixir concurrency is built on BEAM processes — not OS threads, not async tasks, but lightweight actors. Each process has its own heap, communicates only by message passing, and crashes without affecting other processes. This is the foundation everything else in OTP is built on.

## Key concepts

**Spawning a process:**

```elixir
pid = spawn(fn -> IO.puts("I run concurrently") end)
```

`spawn/1` takes a zero-arity function, starts it in a new process, and immediately returns a PID. The spawned function runs concurrently. When it returns, the process exits.

**Sending and receiving messages:**

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

`send/2` is non-blocking and always succeeds (even if the target is dead). `receive` blocks the calling process until a matching message arrives. Messages are pattern-matched in order.

**Timeouts with `after`:**

```elixir
receive do
  {:pong} -> :ok
after
  1000 -> {:error, :timeout}
end
```

**Self and PID:**

```elixir
self()          # => #PID<0.123.0> — PID of the current process
Process.alive?(pid)  # => true / false
```

**Process isolation:** if a spawned process crashes, the caller is unaffected unless you use `spawn_link/1`, which propagates the exit signal.

```elixir
# spawn: crash is silent to caller
spawn(fn -> raise "boom" end)

# spawn_link: crash kills the caller too (or is caught if caller traps exits)
spawn_link(fn -> raise "boom" end)
```

In production you rarely use raw `spawn` — OTP's `GenServer` (concept 07) handles the lifecycle for you. But understanding `spawn/receive/send` is what makes GenServer legible.

## vs other languages

| | Elixir | Go | Python | Java |
|---|---|---|---|---|
| Concurrency unit | BEAM process (actor) | goroutine | thread / asyncio task | thread / virtual thread |
| Communication | message passing | channel | queue / shared memory | shared memory + locks |
| Failure isolation | process boundary | goroutine panic kills program | thread exception | uncaught exception |
| Spawn cost | ~2 KB heap, microseconds | ~4–8 KB stack, nanoseconds | ~MB per thread | ~MB per thread |

The key difference from Go channels: an Elixir `receive` selects by pattern, not by channel. A process has one mailbox; messages pile up and are pattern-matched in arrival order. A message that doesn't match any clause stays in the mailbox.

## The task

Implement these functions in the `Messenger` module:

1. `echo_server()` — spawns a process that loops, waiting for `{:echo, sender, msg}` messages and replies with `{:echo_reply, msg}`. The loop continues until the process receives `:stop`. Returns the PID of the spawned process.

2. `ask(pid, msg)` — sends `{:echo, self(), msg}` to `pid`, then blocks with `receive` until a `{:echo_reply, reply}` arrives (timeout 1000 ms). Returns the reply string, or `{:error, :timeout}`.

3. `stop(pid)` — sends `:stop` to `pid`.
