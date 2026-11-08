# Step 3 — GET /posts/:id

Clients can now create posts. This step adds a read path. It is the
first endpoint that reads existing rows. The fixtures for this step
already contain draft rows to fetch.

## The task

Add a handler for `GET /posts/:id`. It fetches one post by its integer
`id`.

**Sample request and response (found, still a draft):**

```
GET /posts/1

200 OK
Content-Type: application/json

{
  "id": 1,
  "title": "Hello, World",
  "body": "This is my first post.",
  "published": false,
  "published_at": null,
  "created_at": "2026-07-01T09:00:00+00:00"
}
```

**Sample request and response (not found):**

```
GET /posts/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the post object as JSON. The body
  must have `published` as a real JSON boolean (`true` or `false`), not
  the strings `"t"` or `"f"`. For a draft, `published_at` must be JSON
  `null`.
- If no post has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path segment after `/posts/` as an integer. For example, use
  `path.split("/")`. Then check that the segment matches `/\A\d+\z/`
  before you call `.to_i`. If the segment is not numeric, return
  `400 Bad Request`.
- Use the same `PG::Connection` from Step 2, with its
  `type_map_for_results`. Do not open a new connection for each request.
