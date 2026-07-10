# Step 2 — POST /users

With the server up from Step 1, it's time to add persistence. This step
introduces the `users` table and the first write path the rest of the
capstone builds on — every later step reads or mutates rows this endpoint
creates. It also introduces the two things every remaining step needs:
reading a request body, and talking to Postgres via libpq.

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
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via libpq's `PQconnectdb`. libpq accepts
  the native `postgresql://user:pass@host/db` connection URI format
  directly — the same format `DATABASE_URL` is already in — so no parsing
  is needed:

  ```cpp
  #include <libpq-fe.h>

  PGconn *conn = PQconnectdb(getenv("DATABASE_URL"));
  if (PQstatus(conn) != CONNECTION_OK) {
    // handle connection failure, PQerrorMessage(conn) has details
  }
  ```

  Wrapping `PGconn*` in a small RAII class (destructor calls `PQfinish`)
  is good practice, but a plain global connection is fine too — use your
  judgment.

- Your server should create the `users` table itself on startup if it
  doesn't already exist, e.g. via `PQexec`:

  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- Reading the request body: once you've parsed the request line and
  skipped past the headers (read until the blank line `\r\n\r\n`), find the
  `Content-Length` header, parse it as an integer, and `recv()` exactly
  that many more bytes as the body.

- Parsing the tiny, fixed-shape JSON bodies this capstone sends
  (`{"name":"...","email":"..."}`) doesn't need a JSON library. A simple
  helper that finds `"name"` in the string, skips to the next `"`, and
  reads until the closing `"` is enough:

  ```cpp
  std::string extract_field(const std::string &json, const std::string &key) {
    std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos + needle.size() + 1);
    auto end = json.find('"', pos + 1);
    return json.substr(pos + 1, end - pos - 1);
  }
  ```

- Use `PQexecParams` with placeholders (`$1`, `$2`) rather than
  string-concatenating values into SQL — this capstone doesn't test for
  SQL injection, but it's the idiomatic, safe way to use libpq and avoids
  quoting bugs.

- Validate that both `name` and `email` are present (non-empty) in the
  request body. If either is missing, return `400 Bad Request`.
