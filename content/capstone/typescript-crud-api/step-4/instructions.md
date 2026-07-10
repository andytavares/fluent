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
  "created_at": "2026-07-01T09:00:00.000Z"
}
```

If the id doesn't exist, return `404 Not Found` with body
`{"error": "not found"}`.

Requirements:

- Accept a body containing `name`, `email`, or both — build the `UPDATE`
  statement dynamically based on which keys are present in the parsed
  JSON, e.g. accumulate `SET` clauses and parameter values into arrays
  before calling `pool.query`.
- Always return the complete, current row on success, not just the fields
  that were sent — `UPDATE ... RETURNING *` gets you this in one
  round-trip.
- Return `404` if no user with the given id exists (an `UPDATE` that
  matches zero rows returns `result.rows.length === 0`).
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
