# Step 1 — Health endpoint

This is the first ticket on the board. Start a bare Python HTTP server
and make it reachable before any database logic exists. Every later step
needs a server that listens and answers, so this step is the smoke test
for the capstone.

Your session has no web framework. It has only a Postgres driver, which
Step 2 uses. Use the standard library `http.server` module.

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

A minimal `http.server` handler looks like this:

```python
import json
from http.server import (
    BaseHTTPRequestHandler,
    HTTPServer,
)

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = json.dumps(
                {"status": "ok"}
            ).encode()
            self.send_response(200)
            self.send_header(
                "Content-Type",
                "application/json",
            )
            self.end_headers()
            self.wfile.write(body)

if __name__ == "__main__":
    server = HTTPServer(
        ("0.0.0.0", 8080), Handler
    )
    server.serve_forever()
```

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server
  setup.
- The response body must be valid JSON with a `status` key. Its value
  must be exactly `"ok"` (case-sensitive).
