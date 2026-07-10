# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Python HTTP server
running and reachable before any database logic exists. Every later step
assumes your server is already listening and healthy, so this is the smoke
test the rest of the capstone builds on.

There's no web framework pre-installed in your session (only a Postgres
driver, see Step 2) — use the standard library's `http.server` module.

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

A minimal `http.server` handler looks like:

```python
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = json.dumps({"status": "ok"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)

if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
```

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
