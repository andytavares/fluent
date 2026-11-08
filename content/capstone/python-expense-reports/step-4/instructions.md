# Step 4 — DELETE /expenses/:id

This is the last single-resource operation: delete an expense. It
completes the single-record CRUD endpoints. Steps 5 and 6 then add the
reporting endpoints, which are the main topic of this capstone.

## The task

Add a handler for `DELETE /expenses/:id`. It deletes an expense by id.

**Sample request and response (deleted):**

```
DELETE /expenses/2

204 No Content
```

**Sample request and response (not found):**

```
DELETE /expenses/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- On success, return `204 No Content` with an empty response body.
- If no expense has that id, return `404` with body
  `{"error": "not found"}`.
- Check `cur.rowcount` after the `DELETE`. If it is zero, the id does
  not exist.
- Parse the path segment as an integer. If it is not numeric, return
  `400 Bad Request`.
