Code.require_file("exemplar.ex", __DIR__)

import MyMacros

defmodule MacrosTest do
  defp run do
    results = [
      check("debug returns the evaluated value", fn ->
        # Suppress stdout for this check by wrapping in a fn
        # We can't easily capture IO.puts, so we check the return value
        result = debug(3 + 4)
        result == 7
      end),
      check("debug with multiplication", fn ->
        result = debug(6 * 7)
        result == 42
      end),
      check("debug with string concat", fn ->
        result = debug("foo" <> "bar")
        result == "foobar"
      end),
      check("repeat 1 time — side effect counted via accumulator", fn ->
        agent_result = Agent.start_link(fn -> 0 end)
        {:ok, agent} = agent_result
        repeat(1, do: Agent.update(agent, &(&1 + 1)))
        count = Agent.get(agent, & &1)
        Agent.stop(agent)
        count == 1
      end),
      check("repeat 3 times", fn ->
        {:ok, agent} = Agent.start_link(fn -> 0 end)
        repeat(3, do: Agent.update(agent, &(&1 + 1)))
        count = Agent.get(agent, & &1)
        Agent.stop(agent)
        count == 3
      end),
      check("repeat 0 times", fn ->
        {:ok, agent} = Agent.start_link(fn -> 0 end)
        repeat(0, do: Agent.update(agent, &(&1 + 1)))
        count = Agent.get(agent, & &1)
        Agent.stop(agent)
        count == 0
      end),
      check("measure returns the function result", fn ->
        {result, _us} = MyMacros.measure(fn -> 99 end)
        result == 99
      end),
      check("measure returns non-negative microseconds", fn ->
        {_result, us} = MyMacros.measure(fn -> :ok end)
        is_integer(us) and us >= 0
      end),
      check("measure timing is plausible for 1ms sleep", fn ->
        {_, us} = MyMacros.measure(fn -> :timer.sleep(1) end)
        # Should be at least 1000 us, and less than 5 seconds
        us >= 1000 and us < 5_000_000
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

MacrosTest.main()
