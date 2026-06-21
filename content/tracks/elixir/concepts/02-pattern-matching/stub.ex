defmodule Matcher do
  @doc "Returns the first element of a list, or nil."
  def first(list) do
    # TODO
    nil
  end

  @doc "Returns the second element of a list, or nil."
  def second(list) do
    # TODO
    nil
  end

  @doc "Describes a tagged tuple as a string."
  def describe_tuple(tuple) do
    # TODO
    "unknown"
  end

  @doc "Returns true if target is in list."
  def contains?(list, target) do
    # TODO
    false
  end
end

IO.inspect(Matcher.first([1, 2, 3]))
IO.inspect(Matcher.second([1, 2, 3]))
IO.inspect(Matcher.describe_tuple({:ok, 42}))
IO.inspect(Matcher.contains?([1, 2, 3], 2))
