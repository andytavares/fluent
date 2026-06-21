defmodule MyMacros do
  @doc """
  Prints DEBUG: <source> => <value> and returns the value.
  """
  defmacro debug(expr) do
    # TODO: use Macro.to_string(expr) for the source text, unquote(expr) for the value
    quote do
      unquote(expr)
    end
  end

  @doc """
  Expands to n sequential executions of block at compile time.
  """
  defmacro repeat(n, do: block) do
    # TODO: generate a list of n copies of block, wrap in a :__block__ AST node
    quote do
      unquote(block)
    end
  end

  @doc """
  Calls fun/0 and returns {result, microseconds}.
  """
  def measure(fun) do
    # TODO: use :timer.tc/1
    {fun.(), 0}
  end
end

import MyMacros

result = debug(2 + 3)
IO.inspect(result)

repeat(3, do: IO.puts("hello"))

{val, us} = measure(fn -> :timer.sleep(1); 42 end)
IO.puts("result=#{val}, took ~#{us}us")
