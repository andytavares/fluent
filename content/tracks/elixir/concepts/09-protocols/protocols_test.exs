Code.require_file("exemplar.ex", __DIR__)

defmodule ProtocolsTest do
  defp run do
    results = [
      check("serialize integer 42", fn ->
        Serializable.serialize(42) == "int:42"
      end),
      check("serialize integer 0", fn ->
        Serializable.serialize(0) == "int:0"
      end),
      check("serialize integer negative", fn ->
        Serializable.serialize(-7) == "int:-7"
      end),
      check("serialize float 3.14", fn ->
        Serializable.serialize(3.14) == "float:3.14"
      end),
      check("serialize float 1.0", fn ->
        Serializable.serialize(1.0) == "float:1.00"
      end),
      check("serialize string hello", fn ->
        Serializable.serialize("hello") == "str:hello"
      end),
      check("serialize string empty", fn ->
        Serializable.serialize("") == "str:"
      end),
      check("serialize list of ints", fn ->
        Serializable.serialize([1, 2, 3]) == "list:[int:1,int:2,int:3]"
      end),
      check("serialize empty list", fn ->
        Serializable.serialize([]) == "list:[]"
      end),
      check("serialize mixed list", fn ->
        Serializable.serialize([1, "a"]) == "list:[int:1,str:a]"
      end),
      check("byte_size integer", fn ->
        Serializable.byte_size(42) == byte_size("int:42")
      end),
      check("byte_size string", fn ->
        Serializable.byte_size("hello") == byte_size("str:hello")
      end),
      check("byte_size list", fn ->
        Serializable.byte_size([1, 2]) == byte_size("list:[int:1,int:2]")
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

ProtocolsTest.main()
