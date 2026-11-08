# Step 4 — PUT /users/:id

Create and read work. Now add the update path. Learners often accept only a
full replacement here. This ticket asks for partial updates, because real
API clients send them.

## The task

Add a handler for `PUT /users/:id`. It updates the `name`, the `email`, or
both, of an existing user.

The request body is **partial**. The client sends only the fields that
change:

```
PUT /users/1
{ "email": "ada.lovelace@example.com" }
```

**Response:** `200 OK` with the full updated record, not only the changed
fields:

```json
{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada.lovelace@example.com",
  "created_at": "2026-07-01T09:00:00Z"
}
```

If the id does not exist, return `404 Not Found` with the body
`{"error": "not found"}`.

Requirements:

- Accept a body with `name`, `email`, or both.
- Build the `UPDATE` statement from the fields that the body contains.
- On success, always return the complete current row, not only the fields
  that the client sent.
- If no user has the given id, return `404`.
- Parse the path parameter as an integer. If it is not numeric, return
  `400 Bad Request`.
