# Step 3 — GET /notes/:id

Now that notes can be created, add a read path. This is the first
endpoint that reads existing rows rather than writing new ones — the
fixtures loaded for this step already contain rows to fetch.

## The task

Add a handler for `GET /notes/:id` that fetches a single note by its
integer `id`.

**Sample request/response (found):**

```
GET /notes/1

200 OK
Content-Type: application/json

{"id":1,"title":"Grocery list","body":"Milk, eggs, bread","tags":["home","shopping"],"created_at":"2026-06-01T09:00:00.000Z","updated_at":"2026-06-01T09:00:00.000Z"}
```

**Sample request/response (not found):**

```
GET /notes/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the note object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no note with that id
  exists.
- Parse the path segment as an integer (e.g. with `Number(...)`, checking
  `Number.isInteger`). If it isn't numeric, return `400 Bad Request`.
- Reuse the same database client you set up in Step 2. `req.url` includes
  the raw path — use `new URL(req.url, "http://localhost")` or split on
  `"/"` to extract the id segment.
