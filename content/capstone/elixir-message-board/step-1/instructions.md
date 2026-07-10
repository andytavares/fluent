# Step 1 — Health endpoint

This is the first ticket on the board: get a bare HTTP server running and
reachable before any database logic exists. There's no Plug/Cowboy/Phoenix
available in this session — you're building directly on Erlang/OTP's
built-in `:gen_tcp` module, hand-parsing just enough of HTTP/1.1 to route a
request and write a response. Every later step reuses the accept loop,
request parser, and response writer you build here.

## The task

Add a handler for `GET /health` that returns a JSON response with status
`200` and this exact body:

```json
{ "status": "ok" }
```

Sample request/response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

### Building the server loop

`:gen_tcp` is Erlang's raw TCP socket API, fully usable from Elixir with no
extra dependency:

```elixir
{:ok, socket} = :gen_tcp.listen(8080, [:binary, packet: :line, active: false, reuseaddr: true])

def accept_loop(socket) do
  {:ok, client} = :gen_tcp.accept(socket)
  handle_client(client)
  accept_loop(socket)
end
```

- `packet: :line` makes each `:gen_tcp.recv/2` call return one line at a
  time, which is a convenient way to read the request line and headers
  without hand-rolling a buffer scanner.
- `active: false` puts the socket in passive mode, so you pull data with
  `:gen_tcp.recv/2` instead of receiving it as mailbox messages — much
  easier to reason about for a simple request/response cycle.
- You don't need to support HTTP keep-alive or concurrent connections for
  this capstone — accept a connection, handle exactly one request on it,
  `:gen_tcp.close/1` it, then loop back to `accept/1`.

### Parsing just enough HTTP

- The first line you `recv` is the request line: `GET /health HTTP/1.1`.
  Split it on whitespace with `String.split/2` — the first token is the
  method, the second is the path. Ignore the HTTP version.
- Keep reading lines until you hit an empty line (`"\r\n"` or `""`) — that
  marks the end of the headers. You don't need to parse header values at
  all for this step (a later step needs `Content-Length` to read a request
  body — cross that bridge then).
- To write a response, build the raw HTTP text yourself and send it back
  over the same socket:

  ```elixir
  body = ~s({"status":"ok"})

  response = "HTTP/1.1 200 OK\r\n" <>
    "Content-Type: application/json\r\n" <>
    "Content-Length: #{byte_size(body)}\r\n" <>
    "\r\n" <> body

  :gen_tcp.send(client, response)
  ```

### The entry-point gotcha

`lib/main.ex` is run via `mix run --no-halt`, and this Mix project has no
`Application` callback module configured, so nothing starts automatically
just because you define a module. Elixir compiles a `.ex` file top to
bottom, and any code written *outside* a `defmodule` block executes
immediately at compile time — that's your entry point. Define your server
logic inside a module, then call it once at the bottom of the file,
outside the module:

```elixir
defmodule Main do
  def start do
    # set up the listen socket and kick off the accept loop
  end
end

Main.start()
```

`--no-halt` just keeps the BEAM VM alive after compilation finishes, so
your accept loop (which never returns) keeps serving requests.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
