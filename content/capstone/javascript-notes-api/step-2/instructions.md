# Step 2 — POST /notes

With the server up from Step 1, it's time to add persistence. This step
introduces the `notes` table and the first write path the rest of the
capstone builds on — every later step reads, updates, or filters rows this
endpoint creates.

Unlike the `users`/`expenses` shape you might have seen elsewhere, a note
has a flexible, loosely-typed `tags` field — a good fit for a Postgres
array column, and for JS's native comfort with arrays as JSON values.

## The task

Add a handler for `POST /notes` that creates a note and persists it in
Postgres.

**Request body:**

```json
{
  "title": "Grocery list",
  "body": "Milk, eggs, bread",
  "tags": ["home", "shopping"]
}
```

`body` and `tags` are optional (`body` defaults to `""`, `tags` defaults
to `[]`). `title` is required.

**Response:** `201 Created` with the inserted row, including the
database-generated `id`, `created_at`, and `updated_at` fields, with
`tags` serialized as a JSON array:

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

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via the `pg` package (pre-fetched into
  your session):

  ```javascript
  const { Client } = require("pg");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  ```

  No other third-party package is available — your session has no network
  access per deploy, only this one pre-fetched driver. Use `$1`, `$2`, ...
  as placeholders in parameterized queries, and `RETURNING` to get the
  generated columns back from an `INSERT`. Pass a JS array straight
  through as a parameter for a `TEXT[]` column — `pg` encodes it as a
  Postgres array for you:

  ```javascript
  const result = await client.query(
    "INSERT INTO notes (title, body, tags) VALUES ($1, $2, $3) " +
      "RETURNING id, title, body, tags, created_at, updated_at",
    [title, body ?? "", tags ?? []]
  );
  const row = result.rows[0];
  ```

- Your server should create the `notes` table itself on startup if it
  doesn't already exist, e.g.:

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

- Validate that `title` is present in the request body. If it's missing,
  return `400 Bad Request`.
- Since `http.createServer` doesn't parse JSON bodies for you, read and
  buffer the request body yourself:

  ```javascript
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const parsed = JSON.parse(body);
    // ...
  });
  ```
