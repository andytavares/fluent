# Step 5 — DELETE /users/:id

This step adds the last single-record operation: remove a user. After this
step, Step 6 adds a collection endpoint.

## The task

Add a handler for `DELETE /users/:id`. It deletes a user by id.

**Sample request and response (deleted):**

```
DELETE /users/2

204 No Content
```

**Sample request and response (not found):**

```
DELETE /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- On success, return `204 No Content` with an empty response body.
- If no user has that id, return `404` with the body
  `{"error": "not found"}`.
- Check the number of rows that the delete affects. Zero rows means that
  the id does not exist.
- Parse the path parameter as an integer. If it is not numeric, return
  `400 Bad Request`.
