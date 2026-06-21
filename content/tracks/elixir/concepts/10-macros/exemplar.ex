defmodule MyMacros do
  @doc """
  Prints DEBUG: <source> => <value> and returns the value.
  """
  defmacro debug(expr) do
    source = Macro.to_string(expr)

    quote do
      result = unquote(expr)
      IO.puts("DEBUG: #{unquote(source)} => #{inspect(result)}")
      result
    end
  end

  @doc """
  Expands to n sequential executions of block at compile time.
  """
  defmacro repeat(n, do: block) do
    statements = List.duplicate(block, n)
    {:__block__, [], statements}
  end

  @doc """
  Calls fun/0 and returns {result, microseconds}.
  """
  def measure(fun) do
    {us, result} = :timer.tc(fun)
    {result, us}
  end
end

import MyMacros

result = debug(2 + 3)
IO.inspect(result)

repeat(3, do: IO.puts("hello"))

{val, _us} = measure(fn -> :timer.sleep(1); 42 end)
IO.puts("result=#{val}")
