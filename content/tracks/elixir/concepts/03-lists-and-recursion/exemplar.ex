defmodule ListUtils do
  @doc "Returns the number of elements in list."
  def my_length(list), do: do_length(list, 0)

  defp do_length([], acc), do: acc
  defp do_length([_ | tail], acc), do: do_length(tail, acc + 1)

  @doc "Returns the sum of all elements."
  def my_sum(list), do: do_sum(list, 0)

  defp do_sum([], acc), do: acc
  defp do_sum([head | tail], acc), do: do_sum(tail, acc + head)

  @doc "Returns the list reversed."
  def my_reverse(list), do: do_reverse(list, [])

  defp do_reverse([], acc), do: acc
  defp do_reverse([head | tail], acc), do: do_reverse(tail, [head | acc])

  @doc "Applies fun to every element, returns a new list."
  def my_map(list, fun), do: do_map(list, fun, []) |> my_reverse()

  defp do_map([], _fun, acc), do: acc
  defp do_map([head | tail], fun, acc), do: do_map(tail, fun, [fun.(head) | acc])

  @doc "Flattens one level of nesting."
  def flatten(list), do: Enum.concat(list)
end

IO.inspect(ListUtils.my_length([1, 2, 3, 4]))
IO.inspect(ListUtils.my_sum([1, 2, 3, 4]))
IO.inspect(ListUtils.my_reverse([1, 2, 3]))
IO.inspect(ListUtils.my_map([1, 2, 3], fn x -> x * 2 end))
IO.inspect(ListUtils.flatten([[1, 2], [3, 4]]))
