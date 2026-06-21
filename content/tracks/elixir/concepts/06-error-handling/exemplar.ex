defmodule SafeMath do
  @doc "Returns {:ok, result} or {:error, reason}."
  def divide(_a, 0), do: {:error, "division by zero"}
  def divide(a, b), do: {:ok, a / b}

  @doc "Returns {:ok, sqrt} for non-negative n, {:error, reason} otherwise."
  def sqrt(n) when n < 0, do: {:error, "cannot take sqrt of negative number"}
  def sqrt(n), do: {:ok, :math.sqrt(n)}

  @doc "Divides a/b, takes sqrt, divides by c. Uses with."
  def safe_pipeline(a, b, c) do
    with {:ok, divided}  <- divide(a, b),
         {:ok, rooted}   <- sqrt(divided),
         {:ok, result}   <- divide(rooted, c) do
      {:ok, result}
    end
  end

  @doc "Parses str to a positive integer."
  def parse_positive_int(str) do
    case Integer.parse(str) do
      {n, ""} when n > 0 -> {:ok, n}
      {0, ""}             -> {:error, "must be positive, got 0"}
      {n, ""} when n < 0  -> {:error, "must be positive, got #{n}"}
      _                   -> {:error, "not a valid integer: #{str}"}
    end
  end
end

IO.inspect(SafeMath.divide(10, 2))
IO.inspect(SafeMath.divide(10, 0))
IO.inspect(SafeMath.sqrt(9.0))
IO.inspect(SafeMath.sqrt(-1.0))
IO.inspect(SafeMath.safe_pipeline(100.0, 4.0, 2.0))
IO.inspect(SafeMath.parse_positive_int("42"))
