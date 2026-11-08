# Step 3 — GET /expenses/:id

You can create expenses now. Add a read path. This is the first endpoint
that reads existing rows instead of writing new ones. The fixtures for
this step already contain rows to fetch.

## The task

Add a handler for `GET /expenses/:id`. It fetches one expense by its
integer `id`.

**Sample request and response (found):**

```
GET /expenses/1

200 OK
Content-Type: application/json

{"id":1,"category":"food",
 "amount_cents":1250,
 "note":"Lunch with team",
 "spent_on":"2026-06-15",
 "created_at":"2026-06-15T12:30:00+00:00"}
```

**Sample request and response (not found):**

```
GET /expenses/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the expense object as JSON.
- If no expense has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path segment as an integer, for example with `int(...)` and
  a `ValueError` check. If it is not numeric, return `400 Bad Request`.
- `self.path` for this route looks like `/expenses/1`. `http.server` has
  no routing, so split on `"/"` to get the id segment.
- Use the database connection from Step 2.
