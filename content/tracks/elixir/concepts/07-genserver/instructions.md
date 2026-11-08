## What you build

You write a `Stack` GenServer: a last-in-first-out stack whose state lives in its own process. `GenServer` wraps the `spawn`/`receive` loop in a fixed set of callbacks. This lesson builds on **Error Handling**.

## Key concepts

### `GenServer` is a generic server behaviour

You write a few callbacks. OTP handles the process lifecycle, the message dispatch, the error recovery hooks and the link to supervisors.

### A GenServer has a client API and callbacks

The client API functions run in the caller's process and send messages. The callbacks run in the server process and handle them.

```elixir
defmodule Counter do
  use GenServer

  # Client API
  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__,
      initial)
  end

  def increment(pid),
    do: GenServer.cast(pid, :increment)

  def value(pid),
    do: GenServer.call(pid, :value)

  # Server callbacks
  @impl GenServer
  def init(initial), do: {:ok, initial}

  @impl GenServer
  def handle_cast(:increment, state),
    do: {:noreply, state + 1}

  @impl GenServer
  def handle_call(:value, _from, state),
    do: {:reply, state, state}
end
```

### `call` waits, `cast` does not

`GenServer.call/2` sends a message and blocks until the server replies. Use it when the caller needs a result. `GenServer.cast/2` sends a message and returns `:ok` at once. Use it for updates that need no confirmation.

### State is a plain value

The state can be an integer, a map, a struct or a list. `init/1` sets the first state. Each callback returns the next state. No other process can change it.

### Callbacks return tuples

The first element of the tuple tells the server what to do next.

```elixir
# From handle_call:
{:reply, reply_value, new_state}
# Sends no reply to the caller
{:noreply, new_state}

# From handle_cast or handle_info:
{:noreply, new_state}
# Stops the server
{:stop, reason, new_state}
```

### `handle_info/2` gets other messages

`handle_info/2` receives every message that does not come through `call` or `cast`. Examples are raw `send/2` messages and timer messages from `:erlang.send_after`.

### A GenServer is a supervised loop

In Go terms, a GenServer is a goroutine with a `select` loop on one input channel. OTP adds supervision, so a supervisor can restart the server.

## Watch out

- A `cast` from one process and a `call` from another have no fixed order.
- From the same caller, the server handles messages in order. A `push` then a `size` sees the pushed value.
- A `handle_call` must return a tuple such as `{:reply, value, state}`.
- A bare return value stops the server with `{:bad_return_value, value}`. The `call` then exits in the caller too.
- `push` and `pop` form a LIFO stack. The last value pushed is the first value popped.

## The task

Write a `Stack` GenServer. Its state is a list in a dedicated process. It has this client API:

1. `start_link()` starts the server with an empty list as its state. It returns `{:ok, pid}`.
2. `push(pid, value)` puts `value` on top of the stack. Use a `cast`.
3. `pop(pid)` removes the top value and returns it. Use a `call`.
4. `peek(pid)` returns the top value and does not remove it.
5. `size(pid)` returns the number of values on the stack.

`pop/1` and `peek/1` return `{:error, :empty}` when the stack is empty. Each `start_link/0` call starts a new, separate stack.

```elixir
{:ok, pid} = Stack.start_link()
Stack.size(pid)  # => 0
Stack.pop(pid)   # => {:error, :empty}
Stack.peek(pid)  # => {:error, :empty}

Stack.push(pid, 1)
Stack.push(pid, 2)
Stack.push(pid, 3)
Stack.size(pid)  # => 3
Stack.peek(pid)  # => 3
Stack.size(pid)  # => 3
Stack.pop(pid)   # => 3
Stack.size(pid)  # => 2
Stack.pop(pid)   # => 2
Stack.pop(pid)   # => 1
Stack.pop(pid)   # => {:error, :empty}
```
