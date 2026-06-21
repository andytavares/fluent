Code.require_file("exemplar.ex", __DIR__)

defmodule EnumAndStreamsTest do
  defp run do
    results = [
      check("word_count basic", fn ->
        wc = Analytics.word_count("the cat sat on the mat")
        wc["the"] == 2 and wc["cat"] == 1 and wc["mat"] == 1
      end),
      check("word_count case-insensitive", fn ->
        wc = Analytics.word_count("Hello hello HELLO")
        wc["hello"] == 3
      end),
      check("word_count empty string", fn ->
        Analytics.word_count("") == %{}
      end),
      check("word_count single word", fn ->
        Analytics.word_count("elixir") == %{"elixir" => 1}
      end),
      check("top_n returns n items", fn ->
        result = Analytics.top_n(%{"a" => 3, "b" => 1, "c" => 2}, 2)
        length(result) == 2
      end),
      check("top_n sorted descending", fn ->
        [{k1, v1}, {k2, v2}] = Analytics.top_n(%{"a" => 3, "b" => 1, "c" => 2}, 2)
        v1 >= v2 and k1 == "a" and k2 == "c"
      end),
      check("top_n n larger than map", fn ->
        result = Analytics.top_n(%{"x" => 1}, 10)
        length(result) == 1
      end),
      check("running_total basic", fn ->
        Analytics.running_total([1, 2, 3, 4]) == [1, 3, 6, 10]
      end),
      check("running_total single element", fn ->
        Analytics.running_total([5]) == [5]
      end),
      check("running_total empty", fn ->
        Analytics.running_total([]) == []
      end),
      check("running_total with negatives", fn ->
        Analytics.running_total([1, -1, 2]) == [1, 0, 2]
      end),
      check("first_prime_above 10 is 11", fn ->
        Analytics.first_prime_above(10) == 11
      end),
      check("first_prime_above 2 is 3", fn ->
        Analytics.first_prime_above(2) == 3
      end),
      check("first_prime_above 1 is 2", fn ->
        Analytics.first_prime_above(1) == 2
      end),
      check("first_prime_above 100 is 101", fn ->
        Analytics.first_prime_above(100) == 101
      end)
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

EnumAndStreamsTest.main()
