# Step 1 — Health endpoint

Start a bare Go HTTP server before you add database code. Every later step
needs this server to listen and answer. This step is the smoke test for the
rest of the capstone.

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

Requirements:

- The server listens on port `8080`.
- This step needs no database connection. It only tests your server setup.
- The response body is valid JSON. Its `status` key has the exact value
  `"ok"`, in lowercase.
