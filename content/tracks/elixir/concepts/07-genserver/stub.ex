defmodule Stack do
  use GenServer

  # --- Client API ---

  @doc "Starts the Stack server. Returns {:ok, pid}."
  def start_link do
    # TODO
    {:error, :not_implemented}
  end

  @doc "Pushes value onto the stack."
  def push(_pid, _value) do
    # TODO
    :ok
  end

  @doc "Pops and returns the top value, or {:error, :empty}."
  def pop(_pid) do
    # TODO
    {:error, :empty}
  end

  @doc "Returns the top value without removing it, or {:error, :empty}."
  def peek(_pid) do
    # TODO
    {:error, :empty}
  end

  @doc "Returns the number of elements."
  def size(_pid) do
    # TODO
    0
  end

  # --- Server callbacks ---

  @impl GenServer
  def init(_) do
    # TODO
    {:ok, []}
  end

  @impl GenServer
  def handle_cast(_msg, state) do
    # TODO
    {:noreply, state}
  end

  @impl GenServer
  def handle_call(_msg, _from, state) do
    # TODO
    {:reply, nil, state}
  end
end

{:ok, pid} = Stack.start_link()
Stack.push(pid, 1)
Stack.push(pid, 2)
IO.inspect(Stack.peek(pid))
IO.inspect(Stack.pop(pid))
IO.inspect(Stack.size(pid))
