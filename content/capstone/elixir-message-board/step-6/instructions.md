# Step 6 — GET /channels (paginated)

The final ticket: a board overview listing every channel, since real
clients want a directory view rather than fetching each channel
individually. The tricky part is channels that exist but have never had a
message posted to them — they still need to show up, with a `null`
last-message timestamp, which means an inner join won't do.

## The task

Add a handler for `GET /channels` that lists channels with offset-based
pagination via query params:

```
GET /channels?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of `50`
  if a caller requests more (`min(limit, 50)`).

**Response:** `200 OK` with:

```json
{
  "channels": [
    { "name": "empty-room", "messages": 0, "last_message_at": null },
    { "name": "general", "messages": 3, "last_message_at": "2026-07-01T09:03:00Z" }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

Requirements:

- Use a `LEFT JOIN` from `channels` to `messages` so a channel with zero
  messages still produces one grouped row (with `COUNT` = 0 and `MAX` =
  `NULL`), rather than being dropped the way an inner join would drop it:

  ```sql
  SELECT channels.name, COUNT(messages.id), MAX(messages.created_at)
  FROM channels
  LEFT JOIN messages ON messages.channel_id = channels.id
  GROUP BY channels.id, channels.name
  ORDER BY channels.name ASC
  LIMIT $1 OFFSET $2;
  ```

  `COUNT(messages.id)` (not `COUNT(*)`) is what makes the zero-messages
  case correct — `COUNT(*)` over the left-joined rows would still count 1
  row (with all-`NULL` message columns) instead of 0.

- The path token you parsed from the request line now includes a query
  string, e.g. `/channels?page=1&limit=10`. Elixir's built-in `URI` module
  handles this cleanly:

  ```elixir
  uri = URI.parse(path)
  query = URI.decode_query(uri.query || "")
  page = Map.get(query, "page", "1") |> String.to_integer()
  limit = Map.get(query, "limit", "10") |> String.to_integer()
  ```

  Route on `uri.path` (`"/channels"`), not the raw path with the query
  string still attached.

- `total` is the total number of channels, independent of the current
  page — use a separate `SELECT COUNT(*) FROM channels` query.
- Use `OFFSET (page - 1) * limit` for pagination, bound as `$1`/`$2` params
  on the grouped query above.
- Clamp `limit` to `50` max even if a caller requests a larger value.
- Order channels alphabetically by name so pagination is deterministic.
- When building the JSON for a row where the `MAX(messages.created_at)`
  came back `nil`, emit `null` (unquoted) for `last_message_at`, not the
  string `"null"` or an empty string.
- Building the `channels` array as JSON is still just string
  interpolation — map each row from `result.rows` to a JSON object string
  and join them with commas inside `[...]`.
