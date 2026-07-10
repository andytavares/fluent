# Step 6 — GET /sensors (paginated)

The final ticket: a directory endpoint listing every sensor that has ever
reported a reading, with a per-sensor summary. Real dashboards want this
list, not a firehose of individual readings — and the fixtures for this
step seed enough distinct sensors to actually exercise pagination.

## The task

Add a handler for `GET /sensors` that lists sensors with offset-based
pagination via query params:

```
GET /sensors?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of `50`
  if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "sensors": [
    { "sensor": "temp-1", "readings": 5, "last_seen": "2026-07-01T13:00:00Z" },
    { "sensor": "temp-2", "readings": 3, "last_seen": "2026-07-01T09:30:00Z" }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

Requirements:

- The path you parsed as the request line's second token now includes a
  query string, e.g. `/sensors?page=1&limit=10`. Split on the first `?` to
  separate the route (`/sensors`) from the query string, then split the
  query string on `&` and each pair on `=` to get `page`/`limit` values.
  A small `std::map<std::string, std::string>` of parsed query params
  works well here.
- Compute the per-sensor summary with `GROUP BY`:

  ```sql
  SELECT sensor, COUNT(*), MAX(taken_at)
  FROM readings
  GROUP BY sensor
  ORDER BY sensor ASC
  LIMIT $1 OFFSET $2;
  ```

- `total` is the total number of *distinct sensors*, independent of the
  current page — use a separate `SELECT COUNT(DISTINCT sensor) FROM
  readings` query, not `COUNT(*)` over all readings.
- Use `OFFSET (page - 1) * limit` for pagination, bound as `$1`/`$2` params
  on the grouped query above.
- Clamp `limit` to `50` max even if a caller requests a larger value.
- Order sensors alphabetically by name (`ORDER BY sensor ASC`) so
  pagination is deterministic across pages.
- Building the `sensors` array as JSON is still just string concatenation —
  loop over `PQntuples(result)` rows, build one object per row, and join
  them with commas inside `[...]`.
