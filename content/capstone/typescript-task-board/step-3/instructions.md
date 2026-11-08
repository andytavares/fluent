# Step 3 — GET /tasks/:id

Clients can now create tasks. This step adds a read path. It is the
first endpoint that reads existing rows. The fixtures for this step
already contain rows to fetch.

## The task

Add a handler for `GET /tasks/:id`. It fetches one task by its integer
`id`.

**Sample request and response (found):**

```
GET /tasks/1

200 OK
Content-Type: application/json

{
  "id": 1,
  "title": "Write launch checklist",
  "status": "todo",
  "assignee": "Priya",
  "created_at": "2026-07-01T09:00:00.000Z"
}
```

**Sample request and response (not found):**

```
GET /tasks/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the task object as JSON.
- If no task has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path segment after `/tasks/` as an integer. For example, take
  the segment from `url.pathname.split("/")`, call `Number()` on it, and
  check it with `Number.isInteger`. If the segment is not numeric, return
  `400 Bad Request`.
- Use the same `Pool` from Step 2. The `pg` pool manages connections for
  you. Do not open a new client for each request.
