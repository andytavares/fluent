defmodule Analytics do
  @doc "Returns a map of %{word => count}, case-insensitive."
  def word_count(text) do
    text
    |> String.downcase()
    |> String.split()
    |> Enum.frequencies()
  end

  @doc "Returns top n {key, count} tuples sorted by count descending."
  def top_n(map, n) do
    map
    |> Enum.sort_by(fn {_k, v} -> v end, :desc)
    |> Enum.take(n)
  end

  @doc "Returns a running total list."
  def running_total(numbers) do
    Enum.scan(numbers, 0, &(&1 + &2))
  end

  @doc "Returns the first prime greater than n."
  def first_prime_above(n) do
    Stream.iterate(n + 1, &(&1 + 1))
    |> Enum.find(&prime?/1)
  end

  defp prime?(2), do: true
  defp prime?(n) when n < 2 or rem(n, 2) == 0, do: false

  defp prime?(n) do
    limit = trunc(:math.sqrt(n))

    3
    |> Stream.iterate(&(&1 + 2))
    |> Stream.take_while(&(&1 <= limit))
    |> Enum.all?(&(rem(n, &1) != 0))
  end
end

IO.inspect(Analytics.word_count("the cat sat on the mat"))
IO.inspect(Analytics.top_n(%{"the" => 3, "cat" => 1, "mat" => 2}, 2))
IO.inspect(Analytics.running_total([1, 2, 3, 4]))
IO.inspect(Analytics.first_prime_above(10))
