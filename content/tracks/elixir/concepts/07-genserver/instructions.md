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

## Watch out

- `push` uses `cast` (fire-and-forget). Because casts don't wait for the server, a `push` immediately followed by `size` from a *different* process isn't guaranteed to see the update — but from the *same* caller, the server processes its mailbox in order, so a `push` then `size` from the same client always observes the pushed value.
- Every `handle_call` clause must return a 3-tuple starting with `:reply` (or `:noreply`/`:stop`). Forgetting the reply tuple — e.g. accidentally returning just the value — crashes the server with a `FunctionClauseError` you'll see on the *client* side as `{:error, ...}` or a timeout, not as a clear message about the server's return shape.
- `push`/`pop` naturally form a LIFO (last-in-first-out) stack: the most recently pushed value is the first one popped.

## The task

Implement a `Stack` GenServer — a last-in-first-out (LIFO) stack whose state lives inside a dedicated process — with the following client API.

**`start_link()`** — starts the server with an empty list as initial state. Returns `{:ok, pid}`.

```elixir
{:ok, pid} = Stack.start_link()
```

**`push(pid, value)`** — pushes `value` onto the stack. Implemented as a `cast` (no reply).

```elixir
Stack.push(pid, 1)
Stack.push(pid, 2)
```

**`pop(pid)`** — removes and returns the top value, or `{:error, :empty}` if the stack has nothing in it. Implemented as a `call` (synchronous).

```elixir
Stack.pop(pid)  # => 2   (the most recently pushed value)
Stack.pop(pid)  # => 1
Stack.pop(pid)  # => {:error, :empty}
```

**`peek(pid)`** — returns the top value without removing it, or `{:error, :empty}`.

```elixir
Stack.push(pid, 42)
Stack.peek(pid)  # => 42
Stack.size(pid)  # => 1   — peek did not remove the element
```

**`size(pid)`** — returns the number of elements currently on the stack.

```elixir
{:ok, pid} = Stack.start_link()
Stack.size(pid)  # => 0
```
