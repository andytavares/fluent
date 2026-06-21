defmodule SafeMath do
  @doc "Returns {:ok, result} or {:error, reason}."
  def divide(_a, 0), do: {:error, "division by zero"}

  def divide(a, b) do
    # TODO
    {:ok, 0}
  end

  @doc "Returns {:ok, sqrt} for non-negative n, {:error, reason} otherwise."
  def sqrt(n) do
    # TODO
    {:ok, 0}
  end

  @doc "Divides a/b, takes sqrt, divides by c. Uses with. Returns {:ok, result} or first error."
  def safe_pipeline(a, b, c) do
    # TODO
    {:error, "not implemented"}
  end

  @doc "Parses str to a positive integer. Returns {:ok, n} or {:error, reason}."
  def parse_positive_int(str) do
    # TODO
    {:error, "not implemented"}
  end
end

IO.inspect(SafeMath.divide(10, 2))
IO.inspect(SafeMath.divide(10, 0))
IO.inspect(SafeMath.sqrt(9.0))
IO.inspect(SafeMath.sqrt(-1.0))
IO.inspect(SafeMath.safe_pipeline(100.0, 4.0, 2.0))
IO.inspect(SafeMath.parse_positive_int("42"))
