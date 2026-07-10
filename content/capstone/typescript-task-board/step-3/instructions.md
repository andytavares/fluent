# Step 3 — GET /tasks/:id

Now that tasks can be created, add a read path. This is the first endpoint
that reads existing rows rather than writing new ones — the fixtures
loaded for this step already contain rows to fetch.

## The task

Add a handler for `GET /tasks/:id` that fetches a single task by its
integer `id`.

**Sample request/response (found):**

```
GET /tasks/1

200 OK
Content-Type: application/json

{"id":1,"title":"Write launch checklist","status":"todo","assignee":"Priya","created_at":"2026-07-01T09:00:00.000Z"}
```

**Sample request/response (not found):**

```
GET /tasks/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the task object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no task with that id
  exists.
- Parse the path segment after `/tasks/` as an integer (e.g. via
  `Number()` and a `Number.isInteger` check on
  `url.pathname.split("/")`). If it isn't numeric, return
  `400 Bad Request`.
- Reuse the same `Pool` you set up in Step 2 — `pg`'s pool manages
  connections for you; don't open a new client per request.
