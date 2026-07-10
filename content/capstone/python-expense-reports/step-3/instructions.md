# Step 3 — GET /expenses/:id

Now that expenses can be created, add a read path. This is the first
endpoint that reads existing rows rather than writing new ones — the
fixtures loaded for this step already contain rows to fetch.

## The task

Add a handler for `GET /expenses/:id` that fetches a single expense by its
integer `id`.

**Sample request/response (found):**

```
GET /expenses/1

200 OK
Content-Type: application/json

{"id":1,"category":"food","amount_cents":1250,"note":"Lunch with team","spent_on":"2026-06-15","created_at":"2026-06-15T12:30:00+00:00"}
```

**Sample request/response (not found):**

```
GET /expenses/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the expense object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no expense with that
  id exists.
- Parse the path segment as an integer (e.g. `int(...)`, catching
  `ValueError`). If it isn't numeric, return `400 Bad Request`.
- `self.path` for this route looks like `/expenses/1` — split on `"/"` to
  pull out the id segment, since `http.server` gives you no routing of its
  own.
- Reuse the same database connection you set up in Step 2.
