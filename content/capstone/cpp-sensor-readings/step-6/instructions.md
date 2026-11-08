# Step 6 — GET /sensors (paginated)

The final step adds a directory endpoint. It lists every sensor that has a
reading, with a summary for each sensor. A dashboard needs this list, not
every single reading. The fixtures for this step contain enough sensors to
test pagination.

## The task

Add a handler for `GET /sensors`. It lists sensors with offset-based
pagination through query parameters:

```
GET /sensors?page=1&limit=10
```

- If `page` is missing, it is `1`.
- If `limit` is missing, it is `10`. If a caller asks for more than `50`,
  use `50`.

**Response:** `200 OK` with:

```json
{
  "sensors": [
    {
      "sensor": "temp-1",
      "readings": 5,
      "last_seen": "2026-07-01T13:00:00Z"
    },
    {
      "sensor": "temp-2",
      "readings": 3,
      "last_seen": "2026-07-01T09:30:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

Requirements:

- The path token from the request line now includes a query string, for
  example `/sensors?page=1&limit=10`. Split on the first `?` to separate
  the route (`/sensors`) from the query string. Split the query string on
  `&`, and split each pair on `=`, to get `page` and `limit`. A
  `std::map<std::string, std::string>` of query parameters works well.
- Compute the summary for each sensor with `GROUP BY`:

```sql
SELECT sensor, COUNT(*), MAX(taken_at)
FROM readings
GROUP BY sensor
ORDER BY sensor ASC
LIMIT $1 OFFSET $2;
```

- `total` is the number of *distinct sensors*, for all pages. Use a
  separate `SELECT COUNT(DISTINCT sensor) FROM readings` query. Do not use
  `COUNT(*)` over all readings.
- Use `OFFSET (page - 1) * limit` for pagination. Bind the values as the
  `$1` and `$2` parameters of the grouped query above.
- Limit `limit` to `50`, even if a caller asks for a larger value.
- Sort sensors by name (`ORDER BY sensor ASC`), so that each page has the
  same rows on every request.
- Build the `sensors` array with string concatenation. Loop over the
  `PQntuples(result)` rows, build one object per row, and join the objects
  with commas inside `[...]`.
