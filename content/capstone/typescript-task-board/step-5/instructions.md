# Step 5 — DELETE /tasks/:id

Here, a delete has a condition. The board lets you delete only finished
work, so unfinished tasks cannot disappear without notice. This step
completes the single-resource endpoints. Step 6 adds a summary view.

## The task

Add a handler for `DELETE /tasks/:id`. It deletes a task by id, but only
if its status is `"done"`.

**Sample request and response (deleted, task was done):**

```
DELETE /tasks/1

204 No Content
```

**Sample request and response (not finished yet):**

```
DELETE /tasks/2

409 Conflict
Content-Type: application/json

{"error":"task not finished"}
```

**Sample request and response (not found):**

```
DELETE /tasks/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Find the task first. If it does not exist, return `404` with body
  `{"error": "not found"}`.
- If the task exists and its status is not `"done"`, return
  `409 Conflict` with body `{"error": "task not finished"}`. Do not
  delete the row.
- If the task exists and its status is `"done"`, delete it. Return
  `204 No Content` with an empty response body.
- Parse the path segment as an integer. If it is not numeric, return
  `400 Bad Request`.
