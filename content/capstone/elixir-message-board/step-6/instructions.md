# Step 6 — GET /channels (paginated)

The final ticket is a board overview that lists every channel. Real
clients want a directory view, not one request per channel. The hard part
is a channel with no messages. It must still show up, with a `null`
last-message timestamp, so an inner join does not work.

## The task

Add a handler for `GET /channels`. It lists channels with offset-based
pagination through query params:

```
GET /channels?page=1&limit=10
```

- `page` defaults to `1` if the request omits it.
- `limit` defaults to `10` if the request omits it. If a caller asks for
  more than `50`, clamp it to `50` (`min(limit, 50)`).

**Response:** `200 OK` with:

```json
{
  "channels": [
    {
      "name": "empty-room",
      "messages": 0,
      "last_message_at": null
    },
    {
      "name": "general",
      "messages": 3,
      "last_message_at":
        "2026-07-01T09:03:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

Requirements:

- Use a `LEFT JOIN` from `channels` to `messages`. A channel with zero
  messages then still produces one grouped row, with `COUNT` = 0 and
  `MAX` = `NULL`. An inner join drops that channel:

  ```sql
  SELECT channels.name,
    COUNT(messages.id),
    MAX(messages.created_at)
  FROM channels
  LEFT JOIN messages
    ON messages.channel_id = channels.id
  GROUP BY channels.id, channels.name
  ORDER BY channels.name ASC
  LIMIT $1 OFFSET $2;
  ```

  `COUNT(messages.id)` gives the correct zero-message count, and
  `COUNT(*)` does not. `COUNT(*)` counts the one left-joined row with
  all-`NULL` message columns, so it returns 1 instead of 0.

- The path token from the request line now includes a query string, for
  example `/channels?page=1&limit=10`. The built-in `URI` module parses
  it:

  ```elixir
  uri = URI.parse(path)
  query = URI.decode_query(uri.query || "")

  page =
    Map.get(query, "page", "1")
    |> String.to_integer()

  limit =
    Map.get(query, "limit", "10")
    |> String.to_integer()
  ```

  Route on `uri.path` (`"/channels"`), not on the raw path with the query
  string still attached.

- `total` is the number of all channels, independent of the current page.
  Get it with a separate `SELECT COUNT(*) FROM channels` query.
- Use `OFFSET (page - 1) * limit` for pagination. Bind the values as the
  `$1` and `$2` params of the grouped query above.
- Clamp `limit` to `50` at most, even if a caller asks for a larger value.
- Order channels by name, alphabetically, so pagination is deterministic.
- `MAX(messages.created_at)` comes back as `nil` for a channel with no
  messages. For that row, emit `null` (unquoted) for `last_message_at`.
  Do not emit the string `"null"` or an empty string.
- Build the `channels` array as JSON with string interpolation. Map each
  row from `result.rows` to a JSON object string. Join the strings with
  commas inside `[...]`.
