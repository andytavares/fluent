# Step 5 — GET /channels/:name/messages

Single-message lookups work. Now add the endpoint that clients use most:
the recent activity feed of a channel. The fixtures for this step seed
more than 10 messages, so the "most recent 10" limit gets a real test.

## The task

Add a handler for `GET /channels/:name/messages`. It returns the 10 most
recent messages in a channel, newest first.

**Sample request and response (found):**

```
GET /channels/general/messages

200 OK
Content-Type: application/json

{
  "channel": "general",
  "messages": [
    {
      "id": 12,
      "author": "grace",
      "body": "...",
      "created_at": "..."
    },
    {
      "id": 11,
      "author": "ada",
      "body": "...",
      "created_at": "..."
    }
  ]
}
```

**Sample request and response (not found):**

```
GET /channels/ghost/messages

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Look up the channel by name first:
  `SELECT id FROM channels WHERE name = $1`. If no row comes back, return
  `404 Not Found` with body `{"error": "not found"}`.
- Query the 10 most recent messages for the id of that channel:

  ```sql
  SELECT id, author, body, created_at
  FROM messages
  WHERE channel_id = $1
  ORDER BY created_at DESC
  LIMIT 10;
  ```

- The `messages` array in the response must be newest first. The query
  already returns that order, so do not reverse it.
- The message objects in the array do not repeat the channel name. It is
  already at the top level as `"channel"`.
- Reuse the Postgrex connection `pid` that you started in Step 2.
