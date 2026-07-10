# Step 3 — POST /channels/:name/messages

With channels in place, add the ability to post a message into one. This
introduces a route with a path segment that names a *parent* resource
(the channel) rather than the resource being created directly — you'll
need to look the channel up before you can insert into `messages`.

## The task

Add a handler for `POST /channels/:name/messages` that posts a message
into an existing channel.

**Request body:**

```json
{ "author": "ada", "body": "hello, general" }
```

**Response:** `201 Created` with the inserted row, including the parent
channel's name:

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
  name — an arbitrary string, not an id.
- Look the channel up by name first (`SELECT id FROM channels WHERE name =
  $1`). If no row comes back, return `404 Not Found` with body
  `{"error": "channel not found"}` — don't attempt the insert at all.
- Validate that both `author` and `body` are present (non-nil, non-empty).
  If either is missing, return `400 Bad Request`.
- Insert with the resolved `channel_id`:

  ```elixir
  Postgrex.query!(pid,
    "INSERT INTO messages (channel_id, author, body) VALUES ($1, $2, $3) RETURNING *",
    [channel_id, author, body]
  )
  ```

- The response body's `channel` field is the channel *name* you already
  have in hand from the lookup — you don't need a join to get it.
- Reuse the extraction helper from Step 2 and the same Postgrex connection
  `pid` you started there.
