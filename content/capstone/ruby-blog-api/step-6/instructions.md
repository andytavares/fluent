# Step 6 — GET /posts (published feed)

The final ticket: the public feed. Readers should only ever see published
posts, ordered by when they went live — drafts stay invisible until
someone calls the publish endpoint from Step 4. The fixtures for this
step seed both published and draft posts so the query actually has
something to filter.

## The task

Add a handler for `GET /posts` that lists published posts with
offset-based pagination via query params:

```
GET /posts?page=1&limit=5
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `5` if omitted, and is clamped to a maximum of `20`
  if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "posts": [
    { "id": 10, "title": "...", "body": "...", "published": true, "published_at": "...", "created_at": "..." },
    { "id": 8, "title": "...", "body": "...", "published": true, "published_at": "...", "created_at": "..." }
  ],
  "total": 7,
  "page": 1,
  "limit": 5
}
```

Requirements:

- Parse the query string yourself from the raw request line — split the
  path on `?` and decode the remainder with `URI.decode_www_form`
  (`require "uri"`), which gives you an array of `[key, value]` pairs.
- Only include posts where `published = true`. Drafts must never appear
  in this response, no matter how recently they were created.
- Order results by `published_at DESC` so the most recently published
  post appears first — this is deliberately different from `created_at`,
  since a post can be created long before it's published.
- `total` is the total count of **published** posts only, independent of
  the current page — use a separate `SELECT COUNT(*) FROM posts WHERE
  published = true` query. With `type_map_for_results` set (from Step 2),
  `COUNT(*)` already comes back as an `Integer`, not a `String` — confirm
  this before building your JSON response, since a stringified
  `"total":"7"` will not match what the grader expects.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `20` max even if a caller requests a larger value.
