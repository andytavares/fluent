defmodule Matcher do
  @doc "Returns the first element of a list, or nil."
  def first([]), do: nil
  def first([head | _]), do: head

  @doc "Returns the second element of a list, or nil."
  def second([_, second | _]), do: second
  def second(_), do: nil

  @doc "Describes a tagged tuple as a string."
  def describe_tuple({:ok, val}), do: "ok: #{val}"
  def describe_tuple({:error, reason}), do: "error: #{reason}"
  def describe_tuple(_), do: "unknown"

  @doc "Returns true if target is in list, using recursive pattern matching."
  def contains?([], _target), do: false
  def contains?([head | _], target) when head == target, do: true
  def contains?([_ | tail], target), do: contains?(tail, target)
end

IO.inspect(Matcher.first([1, 2, 3]))
IO.inspect(Matcher.second([1, 2, 3]))
IO.inspect(Matcher.describe_tuple({:ok, 42}))
IO.inspect(Matcher.contains?([1, 2, 3], 2))
