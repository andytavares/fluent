# Step 6 — GET /reports/monthly

The final ticket combines everything: it filters by a date range and
aggregates inside it. Real reporting code uses this query shape all the
time: "totals for period X". Let Postgres filter the dates. Do not pull
every row and check `spent_on` in Python.

## The task

Add a handler for `GET /reports/monthly`. It reports the total spend and
a breakdown per category for a given year and month:

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
    {
      "category": "food",
      "total_cents": 2000,
      "count": 2
    },
    {
      "category": "transport",
      "total_cents": 300,
      "count": 1
    }
  ]
}
```

Use `urllib.parse` to read query parameters from `self.path` in your
`http.server` handler:

```python
from urllib.parse import (
    urlparse,
    parse_qs,
)

parsed = urlparse(self.path)
params = parse_qs(parsed.query)
year = int(params.get("year", [""])[0])
month = int(params.get("month", [""])[0])
```

Requirements:

- Filter rows in SQL with
  `EXTRACT(YEAR FROM spent_on) = %s AND EXTRACT(MONTH FROM spent_on) = %s`,
  or an equivalent date-range comparison.
- Do not fetch every row and check it in Python.
- `total_cents` is the sum of `amount_cents` across all matching rows,
  in all categories.
- `by_category` splits the same filtered rows per category, with the
  `GROUP BY` shape from Step 5.
- Each `by_category` entry has `category`, `total_cents` and `count`.
- Return `400 Bad Request` if `year` or `month` is missing or not
  numeric.
- Also return `400 Bad Request` if `month` is outside `1..12`.
- If no expenses match the year and month, return `200` with
  `total_cents: 0` and `by_category: []`.
- A month with no spending is not an error.
