defmodule Stack do
  use GenServer

  # --- Client API ---

  def start_link do
    GenServer.start_link(__MODULE__, [])
  end

  def push(pid, value) do
    GenServer.cast(pid, {:push, value})
  end

  def pop(pid) do
    GenServer.call(pid, :pop)
  end

  def peek(pid) do
    GenServer.call(pid, :peek)
  end

  def size(pid) do
    GenServer.call(pid, :size)
  end

  # --- Server callbacks ---

  @impl GenServer
  def init(_), do: {:ok, []}

  @impl GenServer
  def handle_cast({:push, value}, state) do
    {:noreply, [value | state]}
  end

  @impl GenServer
  def handle_call(:pop, _from, []), do: {:reply, {:error, :empty}, []}
  def handle_call(:pop, _from, [head | tail]), do: {:reply, head, tail}

  def handle_call(:peek, _from, []), do: {:reply, {:error, :empty}, []}
  def handle_call(:peek, _from, [head | _] = state), do: {:reply, head, state}

  def handle_call(:size, _from, state), do: {:reply, length(state), state}
end

{:ok, pid} = Stack.start_link()
Stack.push(pid, 1)
Stack.push(pid, 2)
IO.inspect(Stack.peek(pid))
IO.inspect(Stack.pop(pid))
IO.inspect(Stack.size(pid))
