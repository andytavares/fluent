# Step 1 — Health endpoint

This is the first ticket on the board: get a bare HTTP server running and
reachable before any database logic exists. There's no web framework
available in this session — you're building directly on top of POSIX
sockets (`socket()`, `bind()`, `listen()`, `accept()`) and hand-parsing just
enough of HTTP/1.1 to route a request and write a response. Every later
step reuses the server loop, request parser, and response writer you build
here, so it's worth getting the shape right now.

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

A minimal raw-socket server looks like this:

1. `socket(AF_INET, SOCK_STREAM, 0)` to create a TCP socket. Set
   `SO_REUSEADDR` with `setsockopt` so restarts (which this session does on
   every code change) don't fail with "address already in use".
2. `bind()` to `0.0.0.0:8080`, then `listen()`.
3. Loop forever: `accept()` a connection, handle exactly one request on it,
   then `close()` the connection and go back to `accept()`. You don't need
   to support HTTP keep-alive or concurrent connections — one request per
   connection, handled synchronously, is enough for every check in this
   capstone.

### Parsing just enough HTTP

Real HTTP/1.1 parsing is a deep rabbit hole. You only need this much:

- `recv()` into a buffer until you see the request line terminator `\r\n`.
  The request line looks like `GET /health HTTP/1.1`. Split it on spaces —
  the first token is the method, the second is the path. Ignore the HTTP
  version and every header that follows.
- You don't need to parse headers at all for this step (later steps need
  `Content-Length` to read a request body — cross that bridge then).
- To write a response, build the raw HTTP text yourself and `send()` it:

  ```cpp
  std::string body = R"({"status":"ok"})";
  std::string response =
      "HTTP/1.1 200 OK\r\n"
      "Content-Type: application/json\r\n"
      "Content-Length: " + std::to_string(body.size()) + "\r\n"
      "\r\n" + body;
  send(client_fd, response.data(), response.size(), 0);
  ```

A `std::string`/`std::vector`-based approach (rather than raw `char*`
buffers everywhere) keeps the parsing and response-building code
manageable — use ordinary C++ idioms on top of the POSIX socket calls.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
