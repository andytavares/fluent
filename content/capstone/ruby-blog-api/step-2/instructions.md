# Step 2 — POST /posts

With the server up from Step 1, it's time to add persistence. This step
introduces the `posts` table and the first write path the rest of the
capstone builds on — every post starts life as a draft, and Step 4 is
what moves it to published.

## The task

Add a handler for `POST /posts` that creates a **draft** post and
persists it in Postgres.

**Request body:**

```json
{ "title": "Hello, World", "body": "This is my first post." }
```

**Response:** `201 Created` with the inserted row:

```json
{
  "id": 1,
  "title": "Hello, World",
  "body": "This is my first post.",
  "published": false,
  "published_at": null,
  "created_at": "2026-07-08T12:00:00+00:00"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via the `pg` gem (pre-fetched into your
  session — no other third-party gem is available, and there's no
  network access to fetch one per redeploy):

  ```ruby
  require "pg"
  require "time" # for Time#iso8601, used below

  conn = PG.connect(ENV.fetch("DATABASE_URL"))
  ```

  By default `pg` returns every column value as a `String`, even for
  boolean and timestamp columns — that's fine for `title`/`body`, but you
  need real types for `published` (a JSON boolean in the response) and
  `created_at`. Turn on automatic type mapping once, right after
  connecting:

  ```ruby
  conn.type_map_for_results = PG::BasicTypeMapForResults.new(conn)
  ```

  With that set, `published` comes back as `true`/`false` and
  `created_at` as a `Time`. Serialize `Time` explicitly with `.iso8601`
  when building your response hash — plain `Time#to_json` does not
  produce ISO 8601. A SQL `NULL` (like `published_at` on a draft) comes
  back as Ruby `nil`, which serializes as JSON `null` automatically.

- Your server should create the `posts` table itself on startup if it
  doesn't already exist:

  ```sql
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  Run this once via `conn.exec(...)` before you start accepting
  connections.

- Use `exec_params` for the insert so values are sent as bind parameters,
  not interpolated into the SQL string:

  ```ruby
  result = conn.exec_params(
    "INSERT INTO posts (title, body) VALUES ($1, $2) RETURNING *",
    [title, body]
  )
  row = result[0]
  ```

  Every post is created as a draft — never accept a `published` field on
  create; `published` and `published_at` are only ever changed by the
  publish workflow in Step 4.

- Validate that both `title` and `body` are present in the parsed JSON
  body. If either is missing, return `400 Bad Request`.
