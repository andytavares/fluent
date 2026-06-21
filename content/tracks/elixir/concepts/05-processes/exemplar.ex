defmodule Messenger do
  @doc "Spawns an echo server process. Returns its PID."
  def echo_server do
    spawn(fn -> loop() end)
  end

  defp loop do
    receive do
      {:echo, sender, msg} ->
        send(sender, {:echo_reply, msg})
        loop()

      :stop ->
        :ok
    end
  end

  @doc "Sends msg to pid, returns the echo reply or {:error, :timeout}."
  def ask(pid, msg) do
    send(pid, {:echo, self(), msg})

    receive do
      {:echo_reply, reply} -> reply
    after
      1000 -> {:error, :timeout}
    end
  end

  @doc "Sends :stop to pid."
  def stop(pid) do
    send(pid, :stop)
    :ok
  end
end

pid = Messenger.echo_server()
IO.inspect(Messenger.ask(pid, "hello"))
IO.inspect(Messenger.ask(pid, "world"))
Messenger.stop(pid)
