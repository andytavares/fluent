# Step 1 — Health endpoint

This is the first ticket on the board. You start a bare TypeScript HTTP
server before any database logic exists. Every later step needs this
server, so this step is the smoke test for the capstone.

Your session has no web framework. It has only `pg` (the Postgres
driver), `typescript` and `tsx`, and it has no network access to get
other packages. Use the built-in Node module `node:http` directly. It is
enough for this API: a few routes, with no need for middleware.

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

Use this minimal server as the base for the rest of the capstone:

```ts
import { createServer } from "node:http";

const JSON_TYPE = {
  "Content-Type": "application/json",
};

const server = createServer(
  async (req, res) => {
    const url = new URL(
      req.url ?? "/",
      "http://localhost",
    );

    if (
      req.method === "GET" &&
      url.pathname === "/health"
    ) {
      res.writeHead(200, JSON_TYPE);
      res.end(
        JSON.stringify({ status: "ok" }),
      );
      return;
    }

    res.writeHead(404, JSON_TYPE);
    const body = { error: "not found" };
    res.end(JSON.stringify(body));
  },
);

server.listen(8080);
```

Your entrypoint is `main.ts`, and the platform runs it with
`npx tsx main.ts`. `tsx` transpiles the file and runs it directly. There
is no separate build step, so each redeploy runs this file again.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It is only a smoke test for
  your server setup.
- The response body must be valid JSON. Its `status` key must have the
  value `"ok"` exactly (case-sensitive).
