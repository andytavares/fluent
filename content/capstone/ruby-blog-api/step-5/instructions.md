# Step 5 — Comments

Posts don't stand alone — readers comment on them. This step adds a
second table with a foreign key back to `posts`, and two endpoints:
adding a comment and listing a post's comments in the order they were
made.

## The task

Add two handlers:

### `POST /posts/:id/comments` — add a comment

**Request body:**

```json
{ "author": "Ada", "body": "Great post!" }
```

**Response:** `201 Created` with the inserted comment row:

```json
{
  "id": 1,
  "post_id": 1,
  "author": "Ada",
  "body": "Great post!",
  "created_at": "2026-07-08T12:00:00+00:00"
}
```

### `GET /posts/:id/comments` — list a post's comments

**Response:** `200 OK` with an array ordered **oldest first**:

```json
[
  { "id": 1, "post_id": 1, "author": "Grace", "body": "Nice writeup.", "created_at": "2026-07-01T09:00:00+00:00" },
  { "id": 2, "post_id": 1, "author": "Ada", "body": "Great post!", "created_at": "2026-07-01T09:05:00+00:00" }
]
```

Requirements:

- Your server should create the `comments` table itself on startup if it
  doesn't already exist:

  ```sql
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

  `ON DELETE CASCADE` means deleting a post also deletes its comments —
  useful to know even though no delete endpoint exists in this capstone.

- `POST /posts/:id/comments`: validate that both `author` and `body` are
  present in the parsed JSON body — if either is missing, return
  `400 Bad Request`. If the post `id` in the path doesn't exist, return
  `404 Not Found` with body `{"error": "not found"}` (a foreign key
  violation from inserting against a missing `post_id` is not an
  acceptable way to produce this — check for the post first).
- `GET /posts/:id/comments`: return `SELECT * FROM comments WHERE post_id
  = $1 ORDER BY created_at ASC` as a JSON array. A post with zero
  comments returns an empty array `[]`, not a 404 — only a missing post
  itself is a 404.
- Parse the path segment (the post id) as an integer in both handlers.
  If it isn't numeric, return `400 Bad Request`.
