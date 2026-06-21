Code.require_file("exemplar.ex", __DIR__)

defmodule ModulesAndFunctionsTest do
  defp run do
    results = [
      check("square(0)", fn -> MathUtils.square(0) == 0 end),
      check("square(5)", fn -> MathUtils.square(5) == 25 end),
      check("square(-3)", fn -> MathUtils.square(-3) == 9 end),
      check("cube(0)", fn -> MathUtils.cube(0) == 0 end),
      check("cube(3)", fn -> MathUtils.cube(3) == 27 end),
      check("cube(-2)", fn -> MathUtils.cube(-2) == -8 end),
      check("sum_of_squares(3, 4)", fn -> MathUtils.sum_of_squares(3, 4) == 25 end),
      check("sum_of_squares(0, 0)", fn -> MathUtils.sum_of_squares(0, 0) == 0 end),
      check("factorial(0)", fn -> MathUtils.factorial(0) == 1 end),
      check("factorial(1)", fn -> MathUtils.factorial(1) == 1 end),
      check("factorial(5)", fn -> MathUtils.factorial(5) == 120 end),
      check("factorial(10)", fn -> MathUtils.factorial(10) == 3_628_800 end),
      check("factorial(-1) raises", fn ->
        try do
          MathUtils.factorial(-1)
          false
        rescue
          ArgumentError -> true
        end
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

ModulesAndFunctionsTest.main()
