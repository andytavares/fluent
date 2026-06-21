defmodule Messenger do
  @doc "Spawns an echo server process. Returns its PID."
  def echo_server do
    # TODO: spawn a process that loops receiving {:echo, sender, msg}
    # and replies with {:echo_reply, msg}, stopping on :stop
    spawn(fn -> nil end)
  end

  @doc "Sends msg to pid, returns the echo reply or {:error, :timeout}."
  def ask(pid, msg) do
    # TODO: send {:echo, self(), msg} and receive {:echo_reply, reply}
    {:error, :timeout}
  end

  @doc "Sends :stop to pid."
  def stop(pid) do
    # TODO
    :ok
  end
end

pid = Messenger.echo_server()
IO.inspect(Messenger.ask(pid, "hello"))
Messenger.stop(pid)
