Code.require_file("exemplar.ex", __DIR__)

defmodule ErrorHandlingTest do
  defp run do
    results = [
      check("divide 10/2", fn -> SafeMath.divide(10, 2) == {:ok, 5.0} end),
      check("divide by zero", fn -> SafeMath.divide(10, 0) == {:error, "division by zero"} end),
      check("divide negative", fn -> SafeMath.divide(-6, 2) == {:ok, -3.0} end),
      check("sqrt of 9.0", fn ->
        {:ok, r} = SafeMath.sqrt(9.0)
        abs(r - 3.0) < 0.0001
      end),
      check("sqrt of 0", fn ->
        {:ok, r} = SafeMath.sqrt(0)
        r == 0.0
      end),
      check("sqrt of negative", fn ->
        SafeMath.sqrt(-1.0) == {:error, "cannot take sqrt of negative number"}
      end),
      check("safe_pipeline success", fn ->
        # 100 / 4 = 25, sqrt(25) = 5, 5 / 2 = 2.5
        {:ok, r} = SafeMath.safe_pipeline(100.0, 4.0, 2.0)
        abs(r - 2.5) < 0.0001
      end),
      check("safe_pipeline div-by-zero b", fn ->
        SafeMath.safe_pipeline(100.0, 0, 2.0) == {:error, "division by zero"}
      end),
      check("safe_pipeline div-by-zero c", fn ->
        SafeMath.safe_pipeline(100.0, 4.0, 0) == {:error, "division by zero"}
      end),
      check("safe_pipeline negative intermediate", fn ->
        # -100 / 4 = -25, sqrt(-25) => error
        {:error, _} = SafeMath.safe_pipeline(-100.0, 4.0, 2.0)
        true
      end),
      check("parse_positive_int valid", fn ->
        SafeMath.parse_positive_int("42") == {:ok, 42}
      end),
      check("parse_positive_int 1", fn ->
        SafeMath.parse_positive_int("1") == {:ok, 1}
      end),
      check("parse_positive_int zero", fn ->
        {:error, _} = SafeMath.parse_positive_int("0")
        true
      end),
      check("parse_positive_int negative", fn ->
        {:error, _} = SafeMath.parse_positive_int("-5")
        true
      end),
      check("parse_positive_int non-integer", fn ->
        {:error, _} = SafeMath.parse_positive_int("abc")
        true
      end),
      check("parse_positive_int float string", fn ->
        {:error, _} = SafeMath.parse_positive_int("3.14")
        true
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

ErrorHandlingTest.main()
