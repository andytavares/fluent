# Step 4 — POST /posts/:id/publish

Every post is created as a draft (Step 2). This step adds the one-way
action that makes it public: publishing. Once published, a post can't be
published again — the endpoint is idempotent in intent (it moves a post
through a state exactly once) but not in behavior (calling it twice is an
error, not a no-op).

## The task

Add a handler for `POST /posts/:id/publish` that publishes a draft post.

**Sample request/response (draft, publishes successfully):**

```
POST /posts/1/publish

200 OK
Content-Type: application/json

{"id":1,"title":"Hello, World","body":"This is my first post.","published":true,"published_at":"2026-07-08T12:00:00+00:00","created_at":"2026-07-01T09:00:00+00:00"}
```

**Sample request/response (already published):**

```
POST /posts/2/publish

409 Conflict
Content-Type: application/json

{"error":"already published"}
```

**Sample request/response (not found):**

```
POST /posts/9999/publish

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Look up the post first. If it doesn't exist, return `404` with body
  `{"error": "not found"}`.
- If it exists but `published` is already `true`, return `409 Conflict`
  with body `{"error": "already published"}` — do not touch the row.
- Otherwise, set `published = true` and `published_at = NOW()` in a
  single `UPDATE ... RETURNING *`, and return `200 OK` with the full
  updated row:

  ```ruby
  result = conn.exec_params(
    "UPDATE posts SET published = true, published_at = NOW() " \
    "WHERE id = $1 RETURNING *",
    [id]
  )
  ```

- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
