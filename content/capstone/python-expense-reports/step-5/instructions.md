# Step 5 — GET /reports/categories

This is the first reporting endpoint. Here this capstone stops being a
plain CRUD app. Application code makes you want to fetch every row and
add things up in Python. Do not do it.

Postgres can group and aggregate. When SQL does that work, you transfer
one small, summarized result instead of every expense row. You also get
the database query planner (indexes, parallel aggregation) at no cost.

## The task

Add a handler for `GET /reports/categories`. It returns the total spend
and a row count per category, across **all** expenses in the table.

**Sample request and response:**

```
GET /reports/categories

200 OK
Content-Type: application/json

{
  "categories": [
    {
      "category": "food",
      "total_cents": 2500,
      "count": 3
    },
    {
      "category": "entertainment",
      "total_cents": 1500,
      "count": 1
    },
    {
      "category": "transport",
      "total_cents": 1000,
      "count": 2
    }
  ]
}
```

Requirements:

- Use a single `GROUP BY` query. Do not fetch all rows and add them up
  in Python.
- Order the `categories` array by `total_cents` **descending**: the
  category with the most spend first.
- `ORDER BY` on the aggregated column does this in one pass. Do not sort
  again in Python.
- `count` is the number of expense rows in that category, not a sum.
- If there are no expenses, return `200` with `{"categories": []}`. An
  empty report is a valid report, not an error.

The query:

```python
cur.execute(
    "SELECT category, "
    "SUM(amount_cents) AS total_cents, "
    "COUNT(*) AS count "
    "FROM expenses GROUP BY category "
    "ORDER BY total_cents DESC"
)
rows = cur.fetchall()
```
