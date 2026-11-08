# Step 2 — POST /posts

Step 1 gave you a running server. This step adds persistence: the
`posts` table and the first write path. Every post starts as a draft.
Step 4 moves a post to published.

## The task

Add a handler for `POST /posts`. It creates a **draft** post and stores
it in Postgres.

**Request body:**

```json
{
  "title": "Hello, World",
  "body": "This is my first post."
}
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

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it. Use the `pg` gem. It is the only third-party
  gem in your session, and the session has no network access to get
  another one.

```ruby
require "pg"
# for Time#iso8601, used below
require "time"

url = ENV.fetch("DATABASE_URL")
conn = PG.connect(url)
```

- By default, `pg` returns every column value as a `String`, also for
  boolean and timestamp columns. That is correct for `title` and `body`.
  But `published` must be a JSON boolean, and `created_at` must be a
  time. Turn on automatic type mapping once, directly after you connect:

```ruby
conn.type_map_for_results =
  PG::BasicTypeMapForResults.new(conn)
```

- With type mapping on, `published` comes back as `true` or `false`, and
  `created_at` comes back as a `Time`. Call `.iso8601` on each `Time`
  when you build the response hash. Plain `Time#to_json` does not give
  ISO 8601. A SQL `NULL`, such as `published_at` on a draft, comes back
  as Ruby `nil`. `nil` becomes JSON `null` automatically.

- Your server must create the `posts` table on startup if it does not
  exist:

```sql
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL
    DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Run this statement once with `conn.exec(...)` before you accept
  connections.

- Use `exec_params` for the insert. It sends the values as bind
  parameters and does not put them into the SQL string:

```ruby
result = conn.exec_params(
  "INSERT INTO posts (title, body) " \
  "VALUES ($1, $2) RETURNING *",
  [title, body]
)
row = result[0]
```

- Every new post is a draft. Never accept a `published` field on create.
  Only the publish workflow in Step 4 changes `published` and
  `published_at`.

- Both `title` and `body` must be in the parsed JSON body. If one of them
  is missing, return `400 Bad Request`.
