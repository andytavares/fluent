# Step 5 — GET /channels/:name/messages

With single-message lookups working, add the endpoint clients actually use
most: the recent activity feed for a channel. The fixtures for this step
seed more than 10 messages so the "most recent 10" limit is actually
exercised, not just satisfied by coincidence.

## The task

Add a handler for `GET /channels/:name/messages` that returns the 10 most
recent messages in a channel, newest first.

**Sample request/response (found):**

```
GET /channels/general/messages

200 OK
Content-Type: application/json

{
  "channel": "general",
  "messages": [
    { "id": 12, "author": "grace", "body": "...", "created_at": "..." },
    { "id": 11, "author": "ada", "body": "...", "created_at": "..." }
  ]
}
```

**Sample request/response (not found):**

```
GET /channels/ghost/messages

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Look the channel up by name first (`SELECT id FROM channels WHERE name =
  $1`). If no row comes back, return `404 Not Found` with body
  `{"error": "not found"}`.
- Query the 10 most recent messages for that channel's id:

  ```sql
  SELECT id, author, body, created_at
  FROM messages
  WHERE channel_id = $1
  ORDER BY created_at DESC
  LIMIT 10;
  ```

- The `messages` array in the response must be newest-first (the same
  order the query already returns) — don't reverse it.
- The message objects in the array don't repeat the channel name (it's
  already at the top level as `"channel"`).
- Reuse the same Postgrex connection `pid` you started in Step 2.
