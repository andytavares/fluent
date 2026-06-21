Code.require_file("exemplar.ex", __DIR__)

defmodule ProcessesTest do
  defp run do
    results = [
      check("echo_server returns a PID", fn ->
        pid = Messenger.echo_server()
        result = is_pid(pid)
        Messenger.stop(pid)
        result
      end),
      check("ask returns echoed message", fn ->
        pid = Messenger.echo_server()
        reply = Messenger.ask(pid, "hello")
        Messenger.stop(pid)
        reply == "hello"
      end),
      check("ask returns echoed message 2", fn ->
        pid = Messenger.echo_server()
        reply = Messenger.ask(pid, "ping")
        Messenger.stop(pid)
        reply == "ping"
      end),
      check("multiple asks work sequentially", fn ->
        pid = Messenger.echo_server()
        r1 = Messenger.ask(pid, "first")
        r2 = Messenger.ask(pid, "second")
        Messenger.stop(pid)
        r1 == "first" and r2 == "second"
      end),
      check("stop terminates process", fn ->
        pid = Messenger.echo_server()
        Messenger.stop(pid)
        # Give scheduler a moment
        Process.sleep(50)
        not Process.alive?(pid)
      end),
      check("ask on dead process returns timeout", fn ->
        pid = Messenger.echo_server()
        Messenger.stop(pid)
        Process.sleep(50)
        result = Messenger.ask(pid, "hello")
        result == {:error, :timeout}
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

ProcessesTest.main()
