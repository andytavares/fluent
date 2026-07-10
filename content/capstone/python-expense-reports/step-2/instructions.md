# Step 2 — POST /expenses

With the server up from Step 1, it's time to add persistence. This step
introduces the `expenses` table and the first write path the rest of the
capstone builds on — every later step reads or aggregates rows this
endpoint creates.

## The task

Add a handler for `POST /expenses` that creates an expense and persists it
in Postgres.

**Request body:**

```json
{
  "category": "food",
  "amount_cents": 1250,
  "note": "Lunch with team",
  "spent_on": "2026-06-15"
}
```

`note` is optional; everything else is required.

**Response:** `201 Created` with the inserted row, including the
database-generated `id` and `created_at` fields:

```json
{
  "id": 1,
  "category": "food",
  "amount_cents": 1250,
  "note": "Lunch with team",
  "spent_on": "2026-06-15",
  "created_at": "2026-06-15T12:00:00+00:00"
}
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session), via `psycopg` (psycopg 3, pre-fetched into
  your session as `psycopg[binary]`):

  ```python
  import os
  import psycopg

  conn = psycopg.connect(os.environ["DATABASE_URL"], autocommit=True)
  ```

  No other third-party package is available — your session has no network
  access per deploy, only this one pre-fetched driver. Use `%s` as the
  placeholder in parameterized queries (psycopg's paramstyle), and
  `RETURNING` to get the generated columns back from an `INSERT`:

  ```python
  with conn.cursor() as cur:
      cur.execute(
          "INSERT INTO expenses (category, amount_cents, note, spent_on) "
          "VALUES (%s, %s, %s, %s) "
          "RETURNING id, category, amount_cents, note, spent_on, created_at",
          (category, amount_cents, note, spent_on),
      )
      row = cur.fetchone()
  ```

- Your server should create the `expenses` table itself on startup if it
  doesn't already exist, e.g.:

  ```sql
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    note TEXT,
    spent_on DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- Validate that `category`, `amount_cents`, and `spent_on` are all present
  in the request body. If any is missing, return `400 Bad Request`.
- `spent_on` and `created_at` come back from psycopg as `date`/`datetime`
  objects, and `json.dumps` doesn't know how to serialize those on its
  own. Pass a `default` function so the encoder falls back to
  `.isoformat()` for anything it doesn't recognize:

  ```python
  json.dumps(payload, default=lambda v: v.isoformat())
  ```
