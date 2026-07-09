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
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session).
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

- Validate that both `name` and `email` are present in the request body.
  If either is missing, return `400 Bad Request`.
