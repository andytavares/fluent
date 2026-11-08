# Step 1 — Health endpoint

In this step, you start a bare C HTTP server before any database logic
exists. Every later step needs this server to listen and answer, so this
step is the smoke test for the capstone.

The session has no web framework. It has only `libpq`, the Postgres
C client library, for later steps. A redeploy has no network access,
so you cannot add other libraries. You build the server on POSIX sockets:
`socket()`, `bind()`, `listen()` and `accept()`. You parse only the part
of HTTP that routing needs.

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

### Minimal HTTP parsing

You need only the request line: the method and the path. Use `read()` to
copy bytes from the client file descriptor into a buffer. Then split the
first line on spaces:

```c
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

static void handle_client(int client_fd) {
    char buf[8192];
    ssize_t n = read(client_fd, buf,
                     sizeof(buf) - 1);
    if (n < 0) n = 0;
    buf[n] = '\0';

    char method[8] = {0};
    char path[256] = {0};
    sscanf(buf, "%7s %255s", method, path);

    const char *status;
    const char *body;
    if (strcmp(method, "GET") == 0
        && strcmp(path, "/health") == 0) {
        status = "200 OK";
        body = "{\"status\":\"ok\"}";
    } else {
        status = "404 Not Found";
        body = "{\"error\":\"not found\"}";
    }

    char response[8192];
    int len = snprintf(
        response, sizeof(response),
        "HTTP/1.1 %s\r\n"
        "Content-Type: "
        "application/json\r\n"
        "Content-Length: %zu\r\n"
        "\r\n%s",
        status, strlen(body), body);
    write(client_fd, response, len);
    close(client_fd);
}

int main(void) {
    int server_fd =
        socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET,
               SO_REUSEADDR, &opt,
               sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(8080);

    bind(server_fd,
         (struct sockaddr *)&addr,
         sizeof(addr));
    listen(server_fd, 16);

    for (;;) {
        int client_fd =
            accept(server_fd, NULL, NULL);
        if (client_fd < 0) continue;
        handle_client(client_fd);
    }
}
```

This step does not parse headers. The `%s` conversion of `sscanf` stops at
whitespace. It reads the method and the path, and it ignores the rest of
the request. Later steps that read a JSON body must also read past the
headers to find `Content-Length` and the body (see Step 2).

Requirements:

- The server must listen on port `8080` on all interfaces.
- This step needs no database connection. It is a smoke test for your
  server setup only.
- The response body must be valid JSON with a `status` key. Its value
  must be exactly `"ok"`, and the match is case-sensitive.
- Always write a `Content-Length` header equal to the byte length of the
  body. `curl` and other clients use it to find the end of the response.
- Set `SO_REUSEADDR`. Each redeploy in this session restarts your server.
  Without this option, the restart fails with "address already in use".
