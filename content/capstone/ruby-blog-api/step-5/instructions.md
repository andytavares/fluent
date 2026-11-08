# Step 5 — Comments

Readers comment on posts. This step adds a second table with a foreign
key to `posts`. It also adds two endpoints: one adds a comment, and one
lists the comments of a post in the order readers wrote them.

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

**Response:** `200 OK` with an array, **oldest first**:

```json
[
  {
    "id": 1,
    "post_id": 1,
    "author": "Grace",
    "body": "Nice writeup.",
    "created_at":
      "2026-07-01T09:00:00+00:00"
  },
  {
    "id": 2,
    "post_id": 1,
    "author": "Ada",
    "body": "Great post!",
    "created_at":
      "2026-07-01T09:05:00+00:00"
  }
]
```

Requirements:

- Your server must create the `comments` table on startup if it does not
  exist:

```sql
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL
    REFERENCES posts(id)
    ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- `ON DELETE CASCADE` means: when you delete a post, Postgres also
  deletes its comments. This capstone has no delete endpoint, but the
  rule is useful to know.

- `POST /posts/:id/comments`: both `author` and `body` must be in the
  parsed JSON body. If one of them is missing, return
  `400 Bad Request`. If the post `id` in the path does not exist, return
  `404 Not Found` with body `{"error": "not found"}`. Check for the post
  first. Do not rely on the foreign key violation from an insert with a
  missing `post_id` to produce the 404.

- `GET /posts/:id/comments`: return the result of this query as a JSON
  array:

```sql
SELECT * FROM comments
WHERE post_id = $1
ORDER BY created_at ASC
```

- A post with zero comments returns an empty array `[]`, not a 404. Only
  a missing post returns 404.

- In both handlers, parse the path segment (the post id) as an integer.
  If it is not numeric, return `400 Bad Request`.
