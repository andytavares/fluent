# Step 4 — PUT /users/:id

With create and read working, add the update path. Learners often make
this endpoint accept only full replacements — this ticket specifically
calls for partial updates, since that's what real API clients expect.

## The task

Add a handler for `PUT /users/:id` that updates an existing user's `name`
and/or `email`.

The request body is **partial** — only the fields that should change are
sent:

```
PUT /users/1
{ "email": "ada.lovelace@example.com" }
```

**Response:** `200 OK` with the full updated record (not just the changed
fields):

```json
{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada.lovelace@example.com",
  "created_at": "2026-07-01T09:00:00Z"
}
```

If the id doesn't exist, return `404 Not Found` with body
`{"error": "not found"}`.

Requirements:

- Accept a body containing `name`, `email`, or both. Reuse the
  `extractField` helper from Step 2 to check which fields are actually
  present in the body (it returns `null` when a field is missing), and
  build the `UPDATE` statement's `SET` clause dynamically based on that —
  e.g. collect the present fields into a list of `"name = ?"` /
  `"email = ?"` fragments and `joinToString(", ")` them:

  ```kotlin
  val sets = mutableListOf<String>()
  val values = mutableListOf<String>()
  name?.let { sets += "name = ?"; values += it }
  email?.let { sets += "email = ?"; values += it }
  ```

- Always return the complete, current row on success, not just the fields
  that were sent — re-`SELECT` after the update, or use
  `UPDATE ... RETURNING *` to get it in the same round trip.
- Return `404` if no user with the given id exists.
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
