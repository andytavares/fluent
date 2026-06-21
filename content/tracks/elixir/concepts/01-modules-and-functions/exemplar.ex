defmodule MathUtils do
  @doc "Returns n squared."
  def square(n), do: n * n

  @doc "Returns n cubed."
  def cube(n), do: n * n * n

  @doc "Returns the sum of squares of a and b."
  def sum_of_squares(a, b) do
    [a, b]
    |> Enum.map(&square/1)
    |> Enum.sum()
  end

  @doc "Returns n! for n >= 0. Raises ArgumentError for negative n."
  def factorial(n) when n < 0,
    do: raise(ArgumentError, "n must be non-negative")

  def factorial(0), do: 1
  def factorial(n), do: n * factorial(n - 1)
end

IO.inspect(MathUtils.square(4))
IO.inspect(MathUtils.cube(3))
IO.inspect(MathUtils.sum_of_squares(3, 4))
IO.inspect(MathUtils.factorial(5))
