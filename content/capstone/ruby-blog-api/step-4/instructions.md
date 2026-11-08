# Step 4 — POST /posts/:id/publish

Every new post is a draft (Step 2). This step adds the one-way action
that makes a post public: publishing. You cannot publish a post a second
time. The endpoint moves a post through this state change exactly once.
A second call is an error, not a no-op.

## The task

Add a handler for `POST /posts/:id/publish`. It publishes a draft post.

**Sample request and response (draft, publish succeeds):**

```
POST /posts/1/publish

200 OK
Content-Type: application/json

{
  "id": 1,
  "title": "Hello, World",
  "body": "This is my first post.",
  "published": true,
  "published_at":
    "2026-07-08T12:00:00+00:00",
  "created_at": "2026-07-01T09:00:00+00:00"
}
```

**Sample request and response (already published):**

```
POST /posts/2/publish

409 Conflict
Content-Type: application/json

{"error":"already published"}
```

**Sample request and response (not found):**

```
POST /posts/9999/publish

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Find the post first. If it does not exist, return `404` with body
  `{"error": "not found"}`.
- If the post exists and `published` is already `true`, return
  `409 Conflict` with body `{"error": "already published"}`. Do not
  change the row.
- Otherwise, set `published = true` and `published_at = NOW()` in one
  `UPDATE ... RETURNING *`. Return `200 OK` with the full updated row:

```ruby
result = conn.exec_params(
  "UPDATE posts SET published = true, " \
  "published_at = NOW() " \
  "WHERE id = $1 RETURNING *",
  [id]
)
```

- Parse the path segment as an integer. If it is not numeric, return
  `400 Bad Request`.
