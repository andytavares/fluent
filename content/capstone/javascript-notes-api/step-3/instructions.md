# Step 3 — GET /notes/:id

You can create notes now. Add a read path. This is the first endpoint
that reads existing rows instead of writing new ones. The fixtures for
this step already contain rows to fetch.

## The task

Add a handler for `GET /notes/:id`. It fetches one note by its integer
`id`.

**Sample request and response (found):**

```
GET /notes/1

200 OK
Content-Type: application/json

{"id":1,"title":"Grocery list",
 "body":"Milk, eggs, bread",
 "tags":["home","shopping"],
 "created_at":"2026-06-01T09:00:00.000Z",
 "updated_at":"2026-06-01T09:00:00.000Z"}
```

**Sample request and response (not found):**

```
GET /notes/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the note object as JSON.
- If no note has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path segment as an integer, for example with `Number(...)`
  and a `Number.isInteger` check. If it is not numeric, return
  `400 Bad Request`.
- Use the database client from Step 2.
- `req.url` contains the raw path. Use
  `new URL(req.url, "http://localhost")`, or split on `"/"`, to get the
  id segment.
