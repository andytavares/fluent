# Step 6 — GET /reports/monthly

The final ticket combines everything: filtering by a date range and
aggregating within it. This is the query shape you'll write constantly in
real reporting code — "totals for period X" — so get comfortable letting
Postgres do the date filtering instead of pulling every row and checking
`spent_on` in Python.

## The task

Add a handler for `GET /reports/monthly` that reports total spend and a
per-category breakdown for a given year and month:

```
GET /reports/monthly?year=2026&month=6
```

**Response:** `200 OK` with:

```json
{
  "year": 2026,
  "month": 6,
  "total_cents": 2300,
  "by_category": [
    { "category": "food", "total_cents": 2000, "count": 2 },
    { "category": "transport", "total_cents": 300, "count": 1 }
  ]
}
```

Use `urllib.parse` to read query params from `self.path` in your
`http.server` handler:

```python
from urllib.parse import urlparse, parse_qs

parsed = urlparse(self.path)
params = parse_qs(parsed.query)
year = int(params.get("year", [""])[0])
month = int(params.get("month", [""])[0])
```

Requirements:

- Filter rows with `EXTRACT(YEAR FROM spent_on) = %s AND EXTRACT(MONTH
  FROM spent_on) = %s` (or an equivalent date-range comparison) — do the
  filtering in SQL, not by fetching every row and checking in Python.
- `total_cents` is the sum of `amount_cents` across all matching rows,
  regardless of category.
- `by_category` breaks that same filtered set down per category (same
  `GROUP BY` shape as Step 5), each entry with `category`, `total_cents`,
  and `count`.
- If `year` or `month` is missing, non-numeric, or `month` is outside
  `1..12`, return `400 Bad Request`.
- If no expenses match the given year/month, return `200` with
  `total_cents: 0` and `by_category: []` — a month with no spending isn't
  an error.
