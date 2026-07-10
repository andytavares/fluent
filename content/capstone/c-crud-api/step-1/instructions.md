# Step 1 — Health endpoint

This is the first ticket on the board: get a bare C HTTP server running and
reachable before any database logic exists. Every later step assumes your
server is already listening and healthy, so this is the smoke test the rest
of the capstone builds on.

There's no web framework here — only `libpq` (the Postgres C client
library, for later steps) is installed, and there's no network access per
redeploy to pull in anything else. You'll build the server directly on
POSIX sockets: `socket()`, `bind()`, `listen()`, `accept()`, hand-parsing
just enough HTTP to route requests.

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

### Minimal HTTP parsing

You only need the request line — method and path. `read()` bytes off the
accepted connection's file descriptor into a buffer, then scan for the
first line and split it on spaces:

```c
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

static void handle_client(int client_fd) {
    char buf[8192];
    ssize_t n = read(client_fd, buf, sizeof(buf) - 1);
    if (n < 0) n = 0;
    buf[n] = '\0';

    char method[8] = {0};
    char path[256] = {0};
    sscanf(buf, "%7s %255s", method, path);

    const char *status;
    const char *body;
    if (strcmp(method, "GET") == 0 && strcmp(path, "/health") == 0) {
        status = "200 OK";
        body = "{\"status\":\"ok\"}";
    } else {
        status = "404 Not Found";
        body = "{\"error\":\"not found\"}";
    }

    char response[8192];
    int len = snprintf(response, sizeof(response),
        "HTTP/1.1 %s\r\nContent-Type: application/json\r\nContent-Length: %zu\r\n\r\n%s",
        status, strlen(body), body);
    write(client_fd, response, len);
    close(client_fd);
}

int main(void) {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(8080);

    bind(server_fd, (struct sockaddr *)&addr, sizeof(addr));
    listen(server_fd, 16);

    for (;;) {
        int client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) continue;
        handle_client(client_fd);
    }
}
```

You don't need to parse headers at all for this step — `sscanf`'s `%s`
conversion stops at whitespace, so it naturally grabs just the method and
path off the request line and ignores everything after it. Later steps
that read a JSON body will need to also read past the headers to find
`Content-Length` and the body (see Step 2).

Requirements:

- The server must listen on port `8080` on all interfaces.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
- Always write a `Content-Length` header that matches the byte length of
  the body — `curl` and other clients rely on it to know when the response
  ends.
- Set `SO_REUSEADDR` so restarting your server (which happens on every
  redeploy in this session) doesn't fail with "address already in use".
