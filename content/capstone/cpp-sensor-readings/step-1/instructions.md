# Step 1 — Health endpoint

This first step gets a bare HTTP server running before any database logic
exists. No web framework is available in this session. You build on POSIX
sockets (`socket()`, `bind()`, `listen()`, `accept()`). You parse only the
part of HTTP/1.1 that routes a request and writes a response. Every later
step reuses the server loop, the request parser and the response writer
from this step.

## The task

Add a handler for `GET /health`. It returns status `200` with this exact
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

A minimal raw-socket server has three parts:

1. Call `socket(AF_INET, SOCK_STREAM, 0)` to create a TCP socket. Set
   `SO_REUSEADDR` with `setsockopt`. The session restarts the server on
   every code change, and without this option a restart fails with
   "address already in use".
2. Call `bind()` on `0.0.0.0:8080`, then call `listen()`.
3. Loop forever. Call `accept()`, handle exactly one request, close the
   connection, then go back to `accept()`.

You do not need HTTP keep-alive or concurrent connections. One request per
connection, handled synchronously, passes every check in this capstone.

### RAII for the client socket

Each accepted connection is a file descriptor. You must close it on every
exit path: success, a parse error, an early return and an exception. Do not
put `close(client_fd)` before every `return`. Wrap the descriptor in a small
RAII type, and let the destructor close it:

```cpp
struct ClientSocket {
  int fd;
  explicit ClientSocket(int fd)
      : fd(fd) {}
  ~ClientSocket() {
    if (fd >= 0) close(fd);
  }
  ClientSocket(const ClientSocket &) =
      delete;
  ClientSocket &operator=(
      const ClientSocket &) = delete;
};
```

Accept into a `ClientSocket` at the top of your per-connection handler. The
descriptor then closes itself, however the function returns. The rule is
"acquire in the constructor, release in the destructor". The same rule
applies to a `PGconn*`, a `std::lock_guard` and a `std::unique_ptr`. With
one resource the gain is small. In larger C++ programs, this pattern
prevents leaks without manual cleanup at every return.

### Parsing the HTTP you need

Full HTTP/1.1 parsing is a large job. You need only this much:

- Call `recv()` into a buffer until you see the request line terminator
  `\r\n`. The request line looks like `GET /health HTTP/1.1`. Split it on
  spaces. The first token is the method, and the second token is the path.
  Ignore the HTTP version and all headers.
- You do not parse headers in this step. A later step reads
  `Content-Length` to get the request body.
- To write a response, build the raw HTTP text and `send()` it.

```cpp
std::string body = R"({"status":"ok"})";
std::string response =
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: " +
    std::to_string(body.size()) +
    "\r\n\r\n" + body;
send(client_fd, response.data(),
     response.size(), 0);
```

Use `std::string` and `std::vector` in place of raw `char*` buffers. Plain
C++ idioms on top of the POSIX socket calls keep the parsing and response
code short.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server setup.
- The response body must be valid JSON with a `status` key. Its value must
  be exactly `"ok"` (case-sensitive).
