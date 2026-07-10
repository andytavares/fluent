# Step 6 — GET /users (paginated)

The final ticket: a collection endpoint for listing users, since real
clients rarely want every row at once. The fixtures for this step seed
enough rows to actually exercise pagination across two pages.

## The task

Add a handler for `GET /users` that lists users with offset-based
pagination via query params:

```
GET /users?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `100` if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "users": [
    { "id": 15, "name": "...", "email": "...", "created_at": "..." },
    { "id": 14, "name": "...", "email": "...", "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

Requirements:

- The path token you parsed from the request line now includes a query
  string, e.g. `/users?page=1&limit=10`. Elixir's built-in `URI` module
  handles this cleanly:

  ```elixir
  uri = URI.parse(path)
  query = URI.decode_query(uri.query || "")
  page = Map.get(query, "page", "1") |> String.to_integer()
  limit = Map.get(query, "limit", "10") |> String.to_integer()
  ```

  Route on `uri.path` (`"/users"`), not the raw path with the query string
  still attached.
- Order results by `created_at DESC` so the newest users appear first.
- `total` is the total count of users in the table, independent of the
  current page — use a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination — bind `limit` and
  `offset` as `$1`/`$2` params on the `SELECT ... LIMIT $1 OFFSET $2`
  query.
- Clamp `limit` to `100` max even if a caller requests a larger value
  (`min(limit, 100)`).
- Building the `users` array as JSON is still just string interpolation —
  map each row from `result.rows` to a JSON object string and join them
  with commas inside `[...]`.
- With the seeded fixtures (15 users) and the default `limit=10`, page 1
  returns 10 users and page 2 returns the remaining 5.
