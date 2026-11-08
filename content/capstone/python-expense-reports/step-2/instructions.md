# Step 2 — POST /expenses

The server from Step 1 is up. Now add persistence. This step adds the
`expenses` table and the first write path. Every later step reads or
aggregates rows that this endpoint creates.

## The task

Add a handler for `POST /expenses`. It creates an expense and stores it
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

`note` is optional. The request must include all the other fields.

**Response:** `201 Created` with the inserted row. The row includes the
`id` and `created_at` fields that the database generates:

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

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it.
- Use `psycopg` (psycopg 3). Your session already has it as
  `psycopg[binary]`.
- No other third-party package is available. Your session has no
  network access per deploy, only this one driver.
- Your server must create the `expenses` table on startup if it does not
  exist.
- Validate that `category`, `amount_cents` and `spent_on` are all
  present in the request body. If one is missing, return
  `400 Bad Request`.

**The connection:**

```python
import os
import psycopg

conn = psycopg.connect(
    os.environ["DATABASE_URL"],
    autocommit=True,
)
```

**The insert.** Use `%s` as the placeholder in parameterized queries.
That is the psycopg paramstyle. Use `RETURNING` to get the generated
columns back from an `INSERT`:

```python
with conn.cursor() as cur:
    cur.execute(
        "INSERT INTO expenses "
        "(category, amount_cents, "
        "note, spent_on) "
        "VALUES (%s, %s, %s, %s) "
        "RETURNING id, category, "
        "amount_cents, note, "
        "spent_on, created_at",
        (category, amount_cents,
         note, spent_on),
    )
    row = cur.fetchone()
```

**The table.** For example:

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

**The dates.** psycopg returns `spent_on` and `created_at` as `date` and
`datetime` objects. `json.dumps` cannot serialize them on its own. Pass
a `default` function, so that the encoder calls `.isoformat()` on any
value it does not know:

```python
json.dumps(
    payload,
    default=lambda v: v.isoformat(),
)
```
