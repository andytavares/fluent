# Step 2 — POST /notes

The server from Step 1 is up. Now add persistence. This step adds the
`notes` table and the first write path. Every later step reads, updates
or filters rows that this endpoint creates.

A note has a flexible, loosely typed `tags` field. A Postgres array
column fits it well, and JavaScript handles arrays as JSON values
natively.

## The task

Add a handler for `POST /notes`. It creates a note and stores it in
Postgres.

**Request body:**

```json
{
  "title": "Grocery list",
  "body": "Milk, eggs, bread",
  "tags": ["home", "shopping"]
}
```

The request must include `title`. `body` and `tags` are optional: `body` defaults to
`""` and `tags` defaults to `[]`.

**Response:** `201 Created` with the inserted row. The row includes the
`id`, `created_at` and `updated_at` fields that the database generates.
`tags` is a JSON array:

```json
{
  "id": 1,
  "title": "Grocery list",
  "body": "Milk, eggs, bread",
  "tags": ["home", "shopping"],
  "created_at": "2026-07-08T12:00:00.000Z",
  "updated_at": "2026-07-08T12:00:00.000Z"
}
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it.
- Use the `pg` package. Your session already has it. No other
  third-party package is available: your session has no network access
  per deploy.
- Your server must create the `notes` table on startup if it does not
  exist.
- Validate that `title` is present in the request body. If it is
  missing, return `400 Bad Request`.

**The connection:**

```javascript
const { Client } = require("pg");

const client = new Client({
  connectionString:
    process.env.DATABASE_URL,
});
await client.connect();
```

**The insert.** Use `$1`, `$2`, ... as placeholders in parameterized
queries. Use `RETURNING` to get the generated columns back from an
`INSERT`. Pass a JavaScript array as the parameter for a `TEXT[]`
column. `pg` encodes it as a Postgres array:

```javascript
const result = await client.query(
  "INSERT INTO notes " +
    "(title, body, tags) " +
    "VALUES ($1, $2, $3) " +
    "RETURNING id, title, body, tags, " +
    "created_at, updated_at",
  [title, body ?? "", tags ?? []]
);
const row = result.rows[0];
```

**The table.** For example:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**The request body.** `http.createServer` does not parse JSON bodies.
Read and buffer the request body yourself:

```javascript
let body = "";
req.on("data", (chunk) => (body += chunk));
req.on("end", async () => {
  const parsed = JSON.parse(body);
  // ...
});
```
