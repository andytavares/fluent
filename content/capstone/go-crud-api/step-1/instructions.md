# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Go HTTP server running and
reachable before any database logic exists. Every later step assumes your
server is already listening and healthy, so this is the smoke test the rest
of the capstone builds on.

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

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
