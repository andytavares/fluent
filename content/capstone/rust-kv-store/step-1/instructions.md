# Step 1 — Health endpoint

This is the first ticket on the board. You start a bare Rust HTTP server
before any database logic exists. Every later step needs this server, so
this step is the smoke test for the capstone.

Your session has no web framework. The only crate in the session is
`postgres`, for later steps. The session has no network access to get
other crates. You build the server directly on
`std::net::TcpListener`. You read each request from the raw TCP stream
and write a raw HTTP response back.

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

### Minimal HTTP parsing

You need only the request line: the method and the path. Read bytes
from the `TcpStream` into a buffer. Find the first line (up to `\r\n` or
`\n`), and split it on spaces:

```rust
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};

fn handle(mut stream: TcpStream) {
    let mut buf = [0u8; 8192];
    let n = stream.read(&mut buf)
        .unwrap_or(0);
    let request =
        String::from_utf8_lossy(&buf[..n]);

    let request_line = request
        .lines()
        .next()
        .unwrap_or("");
    let mut parts =
        request_line.split_whitespace();
    let method =
        parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("");

    let (status, body) =
        match (method, path) {
            ("GET", "/health") => (
                "200 OK",
                r#"{"status":"ok"}"#,
            ),
            _ => (
                "404 Not Found",
                r#"{"error":"not found"}"#,
            ),
        };

    let response = format!(
        "HTTP/1.1 {status}\r\n\
         Content-Type: \
         application/json\r\n\
         Content-Length: {}\r\n\r\n{body}",
        body.len()
    );
    let _ = stream
        .write_all(response.as_bytes());
}

fn main() {
    let listener =
        TcpListener::bind("0.0.0.0:8080")
            .expect("bind failed");
    for incoming in listener.incoming() {
        if let Ok(stream) = incoming {
            handle(stream);
        }
    }
}
```

This step does not parse headers. Ignore everything after the request
line. Later steps read a JSON body, so they must also read past the
headers to find the start of the body (see Step 2).

Requirements:

- The server must listen on `0.0.0.0:8080`.
- This step needs no database connection. It is only a smoke test for
  your server setup.
- The response body must be valid JSON. Its `status` key must have the
  value `"ok"` exactly (case-sensitive).
- Always write a `Content-Length` header equal to the byte length of the
  body. `curl` and other clients use it to find the end of the response.
