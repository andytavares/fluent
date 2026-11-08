# Step 1 — Health endpoint

This is the first ticket on the board: start a bare HTTP server before any
database logic exists. This session has no Plug, Cowboy or Phoenix. You
build on the Erlang/OTP `:gen_tcp` module and parse only enough HTTP/1.1
to route a request and write a response. Every later step reuses the
accept loop, the request parser and the response writer from this step.

## The task

Add a handler for `GET /health`. It returns status `200` and this exact
JSON body:

```json
{ "status": "ok" }
```

Sample request and response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

### Building the server loop

`:gen_tcp` is the Erlang raw TCP socket API. Elixir can call it with no
extra dependency:

```elixir
{:ok, socket} =
  :gen_tcp.listen(8080, [
    :binary,
    packet: :line,
    active: false,
    reuseaddr: true
  ])

def accept_loop(socket) do
  {:ok, client} = :gen_tcp.accept(socket)
  handle_client(client)
  accept_loop(socket)
end
```

- `packet: :line` makes each `:gen_tcp.recv/2` call return one line. You
  read the request line and the headers without a buffer scanner of your
  own.
- `active: false` puts the socket in passive mode. You pull data with
  `:gen_tcp.recv/2`, and no data arrives as mailbox messages. This keeps a
  simple request and response cycle easy to follow.
- You do not need HTTP keep-alive or concurrent connections. Accept a
  connection and handle one request on it. Then close it with
  `:gen_tcp.close/1` and loop back to `accept/1`.

### Parsing enough HTTP

- The first line you `recv` is the request line: `GET /health HTTP/1.1`.
  Split it on whitespace with `String.split/2`. The first token is the
  method and the second is the path. Ignore the HTTP version.
- Read lines until you get an empty line (`"\r\n"` or `""`). The empty
  line marks the end of the headers. This step does not need header
  values. A later step reads `Content-Length` to get a request body.
- To write a response, build the raw HTTP text and send it back over the
  same socket:

  ```elixir
  body = ~s({"status":"ok"})

  response =
    "HTTP/1.1 200 OK\r\n" <>
      "Content-Type: application/json\r\n" <>
      "Content-Length: #{byte_size(body)}" <>
      "\r\n\r\n" <> body

  :gen_tcp.send(client, response)
  ```

### The entry-point gotcha

`mix run --no-halt` runs `lib/main.ex`. This Mix project configures no
`Application` callback module, so a module definition alone starts
nothing. Elixir compiles a `.ex` file from top to bottom. Code outside a
`defmodule` block runs at compile time, and that code is your entry point.
Put the server logic in a module, then call it once at the bottom of the
file, outside the module:

```elixir
defmodule Main do
  def start do
    # Open the listen socket and start
    # the accept loop.
  end
end

Main.start()
```

`--no-halt` keeps the BEAM VM alive after compilation. Your accept loop
never returns, so it keeps serving requests.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server setup.
- The response body must be valid JSON with a `status` key. Its value must
  be exactly `"ok"` (case-sensitive).
