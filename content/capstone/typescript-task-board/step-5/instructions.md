# Step 5 — DELETE /tasks/:id

Removing a task isn't unconditional here: the board only allows deleting
work that's actually finished, so unfinished tasks can't quietly
disappear. This closes out the single-resource surface before Step 6
adds an aggregate view.

## The task

Add a handler for `DELETE /tasks/:id` that deletes a task by id, but only
if its status is `"done"`.

**Sample request/response (deleted, task was done):**

```
DELETE /tasks/1

204 No Content
```

**Sample request/response (not finished yet):**

```
DELETE /tasks/2

409 Conflict
Content-Type: application/json

{"error":"task not finished"}
```

**Sample request/response (not found):**

```
DELETE /tasks/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Look up the task first. If it doesn't exist, return `404` with body
  `{"error": "not found"}`.
- If it exists but its status isn't `"done"`, return `409 Conflict` with
  body `{"error": "task not finished"}` — do not delete the row.
- If it exists and its status is `"done"`, delete it and return
  `204 No Content` with an empty response body.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
