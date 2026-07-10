# Step 3 — GET /posts/:id

Now that posts can be created, add a read path. This is the first
endpoint that reads existing rows rather than writing new ones — the
fixtures loaded for this step already contain draft rows to fetch.

## The task

Add a handler for `GET /posts/:id` that fetches a single post by its
integer `id`.

**Sample request/response (found, still a draft):**

```
GET /posts/1

200 OK
Content-Type: application/json

{"id":1,"title":"Hello, World","body":"This is my first post.","published":false,"published_at":null,"created_at":"2026-07-01T09:00:00+00:00"}
```

**Sample request/response (not found):**

```
GET /posts/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the post object as JSON if the id exists. The body
  must include `published` as a real JSON boolean (`true`/`false`, not
  `"t"`/`"f"` strings), and `published_at` as JSON `null` for a draft.
- Return `404` with body `{"error": "not found"}` if no post with that id
  exists.
- Parse the path segment after `/posts/` as an integer (e.g.
  `path.split("/")` then check the segment matches `/\A\d+\z/` before
  calling `.to_i`). If it isn't numeric, return `400 Bad Request`.
- Reuse the same `PG::Connection` (and its `type_map_for_results`) you
  set up in Step 2 — don't open a new connection per request.
