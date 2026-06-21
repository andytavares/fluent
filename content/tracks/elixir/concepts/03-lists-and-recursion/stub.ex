defmodule ListUtils do
  @doc "Returns the number of elements in list."
  def my_length(list) do
    # TODO: use a tail-recursive accumulator
    0
  end

  @doc "Returns the sum of all elements."
  def my_sum(list) do
    # TODO: use a tail-recursive accumulator
    0
  end

  @doc "Returns the list reversed."
  def my_reverse(list) do
    # TODO: use a tail-recursive accumulator
    []
  end

  @doc "Applies fun to every element, returns a new list."
  def my_map(list, fun) do
    # TODO
    []
  end

  @doc "Flattens one level of nesting."
  def flatten(list) do
    # TODO
    []
  end
end

IO.inspect(ListUtils.my_length([1, 2, 3, 4]))
IO.inspect(ListUtils.my_sum([1, 2, 3, 4]))
IO.inspect(ListUtils.my_reverse([1, 2, 3]))
IO.inspect(ListUtils.my_map([1, 2, 3], fn x -> x * 2 end))
IO.inspect(ListUtils.flatten([[1, 2], [3, 4]]))
