# Step 4 — GET /messages/:id

Now add a direct lookup for one message by its own id. In Step 3 the
channel name came from the lookup you already did. Here you start from
the message id alone, so the channel name comes from a join.

## The task

Add a handler for `GET /messages/:id`. It fetches one message by its
integer `id`, joined with the name of its channel.

**Sample request and response (found):**

```
GET /messages/1

200 OK
Content-Type: application/json

{
  "id": 1,
  "channel": "general",
  "author": "ada",
  "body": "hello, general",
  "created_at": "2026-07-01T09:05:00Z"
}
```

**Sample request and response (not found):**

```
GET /messages/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Join `messages` to `channels` to get the channel name in one query:

  ```sql
  SELECT messages.id, channels.name,
    messages.author, messages.body,
    messages.created_at
  FROM messages
  JOIN channels
    ON channels.id = messages.channel_id
  WHERE messages.id = $1;
  ```

- If the id exists, return `200` with the message object as JSON.
- If no message has that id, return `404` with body
  `{"error": "not found"}`. Check `result.num_rows == 0` on the
  `Postgrex.Result`.
- Parse the path parameter as an integer with `Integer.parse/1`. It
  returns `:error` on non-numeric input. `String.to_integer/1` raises
  instead. If the id is not numeric, return `400 Bad Request`.
- Reuse the Postgrex connection `pid` that you started in Step 2.
