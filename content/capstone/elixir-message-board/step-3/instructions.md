# Step 3 — POST /channels/:name/messages

Channels exist, so now you post a message into one. The route has a path
segment that names a *parent* resource, the channel. You look up the
channel before you insert into `messages`.

## The task

Add a handler for `POST /channels/:name/messages`. It posts a message into
an existing channel.

**Request body:**

```json
{
  "author": "ada",
  "body": "hello, general"
}
```

**Response:** `201 Created` with the inserted row and the name of the
parent channel:

```json
{
  "id": 1,
  "channel": "general",
  "author": "ada",
  "body": "hello, general",
  "created_at": "2026-07-08T12:00:00Z"
}
```

Requirements:

- The path segment between `/channels/` and `/messages` is the channel
  name. It is an arbitrary string, not an id.
- Look up the channel by name first:
  `SELECT id FROM channels WHERE name = $1`. If no row comes back, return
  `404 Not Found` with body `{"error": "channel not found"}`. Do not try
  the insert.
- Make sure that `author` and `body` are present: not nil and not empty.
  If either is missing, return `400 Bad Request`.
- Insert with the `channel_id` from the lookup:

  ```elixir
  Postgrex.query!(
    pid,
    "INSERT INTO messages " <>
      "(channel_id, author, body) " <>
      "VALUES ($1, $2, $3) RETURNING *",
    [channel_id, author, body]
  )
  ```

- The `channel` field in the response is the channel *name*. You already
  have it from the lookup, so you do not need a join.
- Reuse the extraction helper from Step 2 and the Postgrex connection
  `pid` that you started there.
