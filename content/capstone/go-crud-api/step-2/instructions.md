# Step 2 — POST /users

The server from Step 1 runs. Now add persistence. This step adds the `users`
table and the first write path. Every later step reads or changes the rows
that this endpoint creates.

## The task

Add a handler for `POST /users`. It creates a user and stores it in
Postgres.

**Request body:**

```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

**Response:** `201 Created` with the inserted row. The row includes the
`id` and `created_at` fields that the database generates:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it.
- Use the `database/sql` package with the `github.com/jackc/pgx/v5/stdlib`
  driver. Your session has this driver already. Import it for its side
  effect, and open it with the driver name `"pgx"`:

  ```go
  import (
      "database/sql"
      _ "github.com/jackc/pgx/v5/stdlib"
  )

  db, err := sql.Open(
      "pgx", os.Getenv("DATABASE_URL"))
  ```

- No other third-party module is available. Your session's `go run` has no
  network access, so it can use only this one driver.
- On startup, your server creates the `users` table if it does not exist.
  For example:

  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- The request body must contain both `name` and `email`. If one is missing,
  return `400 Bad Request`.
