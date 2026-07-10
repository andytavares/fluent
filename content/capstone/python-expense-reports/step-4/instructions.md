# Step 4 — DELETE /expenses/:id

The last single-resource operation: removing an expense. This closes out
the single-record CRUD surface before Steps 5 and 6 add the reporting
endpoints the rest of this capstone is really about.

## The task

Add a handler for `DELETE /expenses/:id` that deletes an expense by id.

**Sample request/response (deleted):**

```
DELETE /expenses/2

204 No Content
```

**Sample request/response (not found):**

```
DELETE /expenses/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `204 No Content` on success, with an empty response body.
- Return `404` with body `{"error": "not found"}` if no expense with that
  id exists.
- Check `cur.rowcount` after the `DELETE`; if it's zero, the id wasn't
  found.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
