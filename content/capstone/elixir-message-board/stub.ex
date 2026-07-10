# Build your Elixir Message Board API here.
# Listen on :8080 and read DATABASE_URL from your environment.
#
# TODO: parse DATABASE_URL with URI.parse/1 and start a Postgrex connection
# (Postgrex.start_link/1 does NOT accept a :url option — pass :hostname,
# :port, :username, :password, :database individually).
#
# TODO: create the `channels` and `messages` tables on startup if they
# don't already exist.
#
# TODO: build a :gen_tcp accept loop and hand-parse just enough of
# HTTP/1.1 to route: GET /health, POST /channels, POST /channels/:name/
# messages, GET /messages/:id, GET /channels/:name/messages, GET /channels.

defmodule Main do
  def start do
    # TODO: replace this with your listen socket + accept loop on :8080.
    IO.puts("listening on :8080")
  end
end

# This file has no Application callback configured, so nothing runs just
# because Main is defined above — this call at file scope is the entry
# point `mix run --no-halt` actually executes.
Main.start()
