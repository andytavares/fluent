# GenServer

## What you'll learn

`GenServer` is OTP's generic server behaviour. It packages the spawn/receive loop from concept 05 into a structured contract: you implement a handful of callbacks, and the framework handles process lifecycle, message dispatch, error recovery hooks, and integration with supervisors.

## Key concepts

**The basic shape:**

```elixir
defmodule Counter do
  use GenServer

  # Client API
  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__, initial, name: __MODULE__)
  end

  def increment(pid), do: GenServer.cast(pid, :increment)
  def value(pid),     do: GenServer.call(pid, :value)

  # Server callbacks
  @impl GenServer
  def init(initial), do: {:ok, initial}

  @impl GenServer
  def handle_cast(:increment, state), do: {:noreply, state + 1}

  @impl GenServer
  def handle_call(:value, _from, state), do: {:reply, state, state}
end
```

**`call` vs `cast`:**

- `GenServer.call/2` is synchronous — it sends a message and blocks until the server replies. Use for queries and operations where the caller needs a result.
- `GenServer.cast/2` is fire-and-forget — it sends a message and returns `:ok` immediately. Use for updates where the caller doesn't need confirmation.

**State:**

State is a plain Elixir value — integer, map, struct, list. `init/1` sets the initial state. Each callback returns a new state (or the same one). There is no shared mutable object; the state lives inside the process and is updated by returning new values from callbacks.

**Return tuples:**

```elixir
# from handle_call:
{:reply, reply_value, new_state}
{:noreply, new_state}            # no response sent to caller

# from handle_cast / handle_info:
{:noreply, new_state}
{:stop, reason, new_state}       # terminate the server
```

**`handle_info/2`** catches any message that isn't routed through `call`/`cast` — including raw `send/2` messages and timer signals (`:erlang.send_after`).

## vs other languages

| | Elixir GenServer | Go service goroutine | Java actor (Akka) | Node.js EventEmitter |
|---|---|---|---|---|
| State location | Inside process | Inside goroutine / struct | Inside actor | Closure variable |
| Call semantics | Synchronous future | Channel send/receive | `ask` pattern | Callback |
| Cast semantics | Async message | Channel send | `tell` pattern | emit |
| Supervision | OTP Supervisor tree | Manual | Akka supervision | Manual |

The closest mental model if you're coming from Go is a goroutine with a select loop that reads from an input channel. GenServer formalizes that pattern and integrates it with the OTP supervision tree so it can be automatically restarted.

## The task

Implement a `Stack` GenServer with the following client API:

1. `start_link()` — starts the server with an empty list as initial state. Returns `{:ok, pid}`.
2. `push(pid, value)` — pushes a value onto the stack (cast — no reply needed).
3. `pop(pid)` — removes and returns the top value, or `{:error, :empty}` if the stack is empty (call — synchronous).
4. `peek(pid)` — returns the top value without removing it, or `{:error, :empty}` (call).
5. `size(pid)` — returns the number of elements (call).
