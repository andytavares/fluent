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

- Return `204 No Content` on success, with an empty response body (no
  `Content-Length: 0` body text — just the status line, headers, and
  nothing after the blank line).
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Check the number of rows affected by the delete. `PQcmdTuples(result)`
  returns this as a string on a `DELETE` result — parse it and treat `"0"`
  as not found.
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
