# Step 4 — GET /messages/:id

Now add a direct lookup for a single message by its own id. Unlike Step 3,
where the channel name came for free from the lookup you'd already done,
here you're starting from the message id alone — the channel name has to
come from a join.

## The task

Add a handler for `GET /messages/:id` that fetches a single message by its
integer `id`, joined with its channel's name.

**Sample request/response (found):**

```
GET /messages/1

200 OK
Content-Type: application/json

{"id":1,"channel":"general","author":"ada","body":"hello, general","created_at":"2026-07-01T09:05:00Z"}
```

**Sample request/response (not found):**

```
GET /messages/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Join `messages` to `channels` to get the channel name in one query:

  ```sql
  SELECT messages.id, channels.name, messages.author, messages.body, messages.created_at
  FROM messages
  JOIN channels ON channels.id = messages.channel_id
  WHERE messages.id = $1;
  ```

- Return `200` with the message object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no message with that
  id exists — check `result.num_rows == 0` on the `Postgrex.Result`.
- Parse the path parameter as an integer with `Integer.parse/1` (it
  returns `:error` on non-numeric input, unlike `String.to_integer/1`
  which raises). If it isn't numeric, return `400 Bad Request`.
- Reuse the same Postgrex connection `pid` you started in Step 2.
