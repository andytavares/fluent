# Step 1 — Health endpoint

This is the first ticket on the board. Start a bare Node HTTP server and
make it reachable before any database logic exists. Every later step
needs a server that listens and answers, so this step is the smoke test
for the capstone.

Your session has no web framework. It has only a Postgres driver, which
Step 2 uses. Use the built-in Node `http` module.

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

A minimal `http` server looks like this:

```javascript
const http = require("http");

const server = http.createServer(
  (req, res) => {
    if (
      req.method === "GET" &&
      req.url === "/health"
    ) {
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({ status: "ok" })
      );
      return;
    }
  }
);

server.listen(8080);
```

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It only tests your server
  setup.
- The response body must be valid JSON with a `status` key. Its value
  must be exactly `"ok"` (case-sensitive).
