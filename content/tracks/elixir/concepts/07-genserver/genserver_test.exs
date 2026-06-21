Code.require_file("exemplar.ex", __DIR__)

defmodule GenServerTest do
  defp run do
    results = [
      check("start_link returns {:ok, pid}", fn ->
        {:ok, pid} = Stack.start_link()
        is_pid(pid)
      end),
      check("size of empty stack is 0", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.size(pid) == 0
      end),
      check("pop empty returns {:error, :empty}", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.pop(pid) == {:error, :empty}
      end),
      check("peek empty returns {:error, :empty}", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.peek(pid) == {:error, :empty}
      end),
      check("push then size", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, :a)
        Stack.push(pid, :b)
        Stack.size(pid) == 2
      end),
      check("push then peek (LIFO)", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, 1)
        Stack.push(pid, 2)
        Stack.peek(pid) == 2
      end),
      check("peek does not remove element", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, 42)
        Stack.peek(pid)
        Stack.size(pid) == 1
      end),
      check("pop returns top and removes it", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, 10)
        Stack.push(pid, 20)
        v = Stack.pop(pid)
        v == 20
      end),
      check("pop decrements size", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, 1)
        Stack.push(pid, 2)
        Stack.pop(pid)
        Stack.size(pid) == 1
      end),
      check("LIFO order: push 1,2,3 then pop all", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, 1)
        Stack.push(pid, 2)
        Stack.push(pid, 3)
        a = Stack.pop(pid)
        b = Stack.pop(pid)
        c = Stack.pop(pid)
        [a, b, c] == [3, 2, 1]
      end),
      check("pop until empty then {:error, :empty}", fn ->
        {:ok, pid} = Stack.start_link()
        Stack.push(pid, :x)
        Stack.pop(pid)
        Stack.pop(pid) == {:error, :empty}
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

GenServerTest.main()
