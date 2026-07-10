# Step 5 — DELETE /users/:id

The last single-resource operation: removing a user. This closes out the
single-record CRUD surface before Step 6 adds a collection endpoint.

## The task

Add a handler for `DELETE /users/:id` that deletes a user by id.

**Sample request/response (deleted):**

```
DELETE /users/2

204 No Content
```

**Sample request/response (not found):**

```
DELETE /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `204 No Content` on success, with an empty response body — call
  `res.writeHead(204)` and `res.end()` with no body argument.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Check `result.rowCount` from `DELETE FROM users WHERE id = $1`; if it's
  `0`, the id wasn't found.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
