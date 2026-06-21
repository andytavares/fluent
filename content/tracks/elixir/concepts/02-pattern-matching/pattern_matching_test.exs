Code.require_file("exemplar.ex", __DIR__)

defmodule PatternMatchingTest do
  defp run do
    results = [
      check("first([1,2,3])", fn -> Matcher.first([1, 2, 3]) == 1 end),
      check("first([])", fn -> Matcher.first([]) == nil end),
      check("first([:a])", fn -> Matcher.first([:a]) == :a end),
      check("second([1,2,3])", fn -> Matcher.second([1, 2, 3]) == 2 end),
      check("second([1])", fn -> Matcher.second([1]) == nil end),
      check("second([])", fn -> Matcher.second([]) == nil end),
      check("describe_tuple {:ok, 42}", fn ->
        Matcher.describe_tuple({:ok, 42}) == "ok: 42"
      end),
      check("describe_tuple {:error, :timeout}", fn ->
        Matcher.describe_tuple({:error, :timeout}) == "error: timeout"
      end),
      check("describe_tuple {:other}", fn ->
        Matcher.describe_tuple({:other}) == "unknown"
      end),
      check("contains? true", fn -> Matcher.contains?([1, 2, 3], 2) == true end),
      check("contains? false", fn -> Matcher.contains?([1, 2, 3], 9) == false end),
      check("contains? empty", fn -> Matcher.contains?([], 1) == false end),
      check("contains? first element", fn -> Matcher.contains?([5, 6, 7], 5) == true end),
      check("contains? last element", fn -> Matcher.contains?([5, 6, 7], 7) == true end)
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

PatternMatchingTest.main()
