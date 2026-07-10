# Step 5 — GET /reports/categories

This is the first reporting endpoint, and where this capstone diverges
from a plain CRUD app. The instinct coming from application code is to
fetch every row and sum things up in Python — resist it. Postgres already
knows how to group and aggregate; pushing that work into SQL means you
transfer one small, already-summarized result set instead of every
expense row, and you get the database's query planner (indexes, parallel
aggregation) for free.

## The task

Add a handler for `GET /reports/categories` that returns total spend and
a row count per category, across **all** expenses in the table.

**Sample request/response:**

```
GET /reports/categories

200 OK
Content-Type: application/json

{
  "categories": [
    { "category": "food", "total_cents": 2500, "count": 3 },
    { "category": "entertainment", "total_cents": 1500, "count": 1 },
    { "category": "transport", "total_cents": 1000, "count": 2 }
  ]
}
```

Requirements:

- Use a single `GROUP BY` query — don't fetch all rows and sum in Python:

  ```python
  cur.execute(
      "SELECT category, SUM(amount_cents) AS total_cents, COUNT(*) AS count "
      "FROM expenses GROUP BY category ORDER BY total_cents DESC"
  )
  rows = cur.fetchall()
  ```

- Order the `categories` array by `total_cents` **descending** — the
  biggest-spend category first. `ORDER BY` on the aggregated column does
  this in one pass; don't re-sort in Python.
- `count` is the number of expense rows in that category, not a sum.
- If there are no expenses at all, return `200` with `{"categories": []}`
  — an empty report is a valid report, not an error.
