defmodule MathUtils do
  @doc "Returns n squared."
  def square(n) do
    # TODO
    0
  end

  @doc "Returns n cubed."
  def cube(n) do
    # TODO
    0
  end

  @doc "Returns the sum of squares of a and b."
  def sum_of_squares(a, b) do
    # TODO
    0
  end

  @doc "Returns n! for n >= 0. Raises ArgumentError for negative n."
  def factorial(n) when n < 0 do
    # TODO
    raise ArgumentError, "n must be non-negative"
  end

  def factorial(0), do: 1

  def factorial(n) do
    # TODO
    0
  end
end

# Run manually to see output
IO.inspect(MathUtils.square(4))
IO.inspect(MathUtils.cube(3))
IO.inspect(MathUtils.sum_of_squares(3, 4))
IO.inspect(MathUtils.factorial(5))
