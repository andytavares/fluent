# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates.

## The task

Add a handler for `POST /users` that creates a user and persists it in
Postgres.

**Request body:**

```json
{ "name": "Alice", "email": "alice@example.com" }
```

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `created_at` fields:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2026-07-08T12:00:00+00:00"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via the `pg` gem (pre-fetched into your
  session — no other third-party gem is available, and there's no network
  access to fetch one per redeploy):

  ```ruby
  require "pg"
  require "time" # for Time#iso8601, used below

  conn = PG.connect(ENV.fetch("DATABASE_URL"))
  ```

  By default `pg` returns every column value as a `String`, even for
  integer and timestamp columns — that's fine for `name`/`email`, but you
  need real types for `id` (an integer in the JSON response) and
  `created_at`. Turn on automatic type mapping once, right after
  connecting:

  ```ruby
  conn.type_map_for_results = PG::BasicTypeMapForResults.new(conn)
  ```

  With that set, `id` comes back as an `Integer` and `created_at` as a
  `Time`. Serialize `Time` explicitly with `.iso8601` when building your
  response hash — plain `Time#to_json` does not produce ISO 8601.

- Your server should create the `users` table itself on startup if it
  doesn't already exist, e.g.:

  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  Run this once via `conn.exec(...)` before you start accepting
  connections.

- Use `exec_params` for the insert so values are sent as bind parameters,
  not interpolated into the SQL string:

  ```ruby
  result = conn.exec_params(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  )
  row = result[0]
  ```

- Validate that both `name` and `email` are present in the parsed JSON
  body. If either is missing, return `400 Bad Request`.
