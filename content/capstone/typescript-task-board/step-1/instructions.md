# Step 1 — Health endpoint

This is the first ticket on the board: get a bare TypeScript HTTP server
running and reachable before any database logic exists. Every later step
assumes your server is already listening and healthy, so this is the smoke
test the rest of the capstone builds on.

Your session has no bundled web framework — only `pg` (the Postgres
driver), `typescript`, and `tsx` are pre-installed, and there's no network
access to fetch anything else per redeploy. Use Node's built-in
`node:http` module directly. That's genuinely enough for this API: a
handful of routes with no middleware needs.

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

A minimal server shape to build on for the rest of the capstone:

```ts
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(8080);
```

Your entrypoint is `main.ts`, run via `npx tsx main.ts` — `tsx` transpiles
and runs directly, so there's no separate build step to remember; every
redeploy just re-executes this file.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
