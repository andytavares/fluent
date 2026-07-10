# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Rust HTTP server running
and reachable before any database logic exists. Every later step assumes
your server is already listening and healthy, so this is the smoke test the
rest of the capstone builds on.

There's no web framework available in this session — only the `postgres`
crate (for later steps) is pre-fetched, and there's no network access per
redeploy to pull in anything else. You'll build the server directly on
`std::net::TcpListener`, reading each request off the raw TCP stream and
writing a raw HTTP response back.

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

You only need the request line — the method and path. Read bytes off the
`TcpStream` into a buffer, find the first line (up to `\r\n` or `\n`), and
split it on spaces:

```rust
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};

fn handle(mut stream: TcpStream) {
    let mut buf = [0u8; 8192];
    let n = stream.read(&mut buf).unwrap_or(0);
    let request = String::from_utf8_lossy(&buf[..n]);

    let request_line = request.lines().next().unwrap_or("");
    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("");

    let (status, body) = match (method, path) {
        ("GET", "/health") => ("200 OK", r#"{"status":"ok"}"#.to_string()),
        _ => ("404 Not Found", r#"{"error":"not found"}"#.to_string()),
    };

    let response = format!(
        "HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{body}",
        body.len()
    );
    let _ = stream.write_all(response.as_bytes());
}

fn main() {
    let listener = TcpListener::bind("0.0.0.0:8080").expect("bind failed");
    for incoming in listener.incoming() {
        if let Ok(stream) = incoming {
            handle(stream);
        }
    }
}
```

You don't need to parse headers at all for this step — ignore everything
after the request line. Later steps that read a JSON body will need to also
read past the headers to find where the body starts (see Step 2).

Requirements:

- The server must listen on `0.0.0.0:8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
- Always write a `Content-Length` header that matches the byte length of
  the body — `curl` and other clients rely on it to know when the response
  ends.
