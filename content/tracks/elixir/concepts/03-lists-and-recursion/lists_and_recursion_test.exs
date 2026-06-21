Code.require_file("exemplar.ex", __DIR__)

defmodule ListsAndRecursionTest do
  defp run do
    results = [
      check("my_length []", fn -> ListUtils.my_length([]) == 0 end),
      check("my_length [1,2,3]", fn -> ListUtils.my_length([1, 2, 3]) == 3 end),
      check("my_length [1..10]", fn -> ListUtils.my_length(Enum.to_list(1..10)) == 10 end),
      check("my_sum []", fn -> ListUtils.my_sum([]) == 0 end),
      check("my_sum [1,2,3,4]", fn -> ListUtils.my_sum([1, 2, 3, 4]) == 10 end),
      check("my_sum [5]", fn -> ListUtils.my_sum([5]) == 5 end),
      check("my_reverse []", fn -> ListUtils.my_reverse([]) == [] end),
      check("my_reverse [1,2,3]", fn -> ListUtils.my_reverse([1, 2, 3]) == [3, 2, 1] end),
      check("my_reverse [1]", fn -> ListUtils.my_reverse([1]) == [1] end),
      check("my_map [] identity", fn -> ListUtils.my_map([], & &1) == [] end),
      check("my_map double", fn ->
        ListUtils.my_map([1, 2, 3], fn x -> x * 2 end) == [2, 4, 6]
      end),
      check("my_map to_string", fn ->
        ListUtils.my_map([1, 2], &to_string/1) == ["1", "2"]
      end),
      check("flatten []", fn -> ListUtils.flatten([]) == [] end),
      check("flatten [[1,2],[3,4]]", fn -> ListUtils.flatten([[1, 2], [3, 4]]) == [1, 2, 3, 4] end),
      check("flatten [[1],[],[2,3]]", fn -> ListUtils.flatten([[1], [], [2, 3]]) == [1, 2, 3] end)
    ]

    passed = Enum.count(results, & &1)
    failed = length(results) - passed
    IO.puts("\n#{passed} passed, #{failed} failed")
    if failed > 0, do: System.halt(1)
  end

  defp check(name, fun) do
    if fun.() do
      IO.puts("  PASS: #{name}")
      true
    else
      IO.puts("  FAIL: #{name}")
      false
    end
  rescue
    e ->
      IO.puts("  FAIL: #{name} — #{Exception.message(e)}")
      false
  end

  def main, do: run()
end

ListsAndRecursionTest.main()
