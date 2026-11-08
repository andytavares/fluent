# Step 6 — GET /posts (published feed)

This is the final ticket: the public feed. Readers see only published
posts, ordered by when they went live. Drafts stay hidden until a client
calls the publish endpoint from Step 4. The fixtures for this step
contain both published and draft posts, so the query has rows to filter.

## The task

Add a handler for `GET /posts`. It lists published posts with
offset-based pagination. Clients send the page and the page size as
query parameters:

```
GET /posts?page=1&limit=5
```

- When `page` is missing, it is `1`.
- When `limit` is missing, it is `5`. If a caller asks for more than
  `20`, clamp `limit` to `20`.

**Response:** `200 OK` with:

```json
{
  "posts": [
    {
      "id": 10,
      "title": "...",
      "body": "...",
      "published": true,
      "published_at": "...",
      "created_at": "..."
    },
    {
      "id": 8,
      "title": "...",
      "body": "...",
      "published": true,
      "published_at": "...",
      "created_at": "..."
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 5
}
```

Requirements:

- Parse the query string yourself from the raw request line. Split the
  path on `?`. Decode the rest with `URI.decode_www_form`
  (`require "uri"`). It returns an array of `[key, value]` pairs.
- Include only posts where `published = true`. Drafts must never be in
  this response, even new drafts.
- Order results by `published_at DESC`, so the newest published post is
  first. This order is not the `created_at` order: you can create a post
  long before you publish it.
- `total` is the count of **published** posts only, independent of the
  current page. Use a separate query:

```sql
SELECT COUNT(*) FROM posts
WHERE published = true
```

- With `type_map_for_results` set (from Step 2), `COUNT(*)` comes back
  as an `Integer`, not a `String`. Confirm this before you build the
  JSON response. The grader does not accept a string such as
  `"total":"7"`.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `20` at most, even if a caller asks for a larger
  value.
