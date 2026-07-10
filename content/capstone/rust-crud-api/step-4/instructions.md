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
  "created_at": "2026-07-01 09:00:00+00"
}
```

If the id doesn't exist, return `404 Not Found` with body
`{"error": "not found"}`.

### Building the update dynamically

Since either field (or both) may be present, build the `SET` clause based
on which keys your hand-rolled JSON parser found. The simplest reliable
approach for this fixed-shape body: use `COALESCE` so a parameter that
wasn't sent falls back to the existing column value, and always pass both
parameters (as `Option<String>`, `None` when absent):

```rust
let row = client
    .query_opt(
        "UPDATE users
         SET name = COALESCE($1, name), email = COALESCE($2, email)
         WHERE id = $3
         RETURNING id, name, email, created_at::text",
        &[&name_opt, &email_opt, &id],
    )
    .expect("update failed");
```

`name_opt` and `email_opt` are `Option<String>` — `postgres`'s `ToSql`
implementation for `Option<T>` sends SQL `NULL` when the value is `None`,
which is exactly what `COALESCE` needs to leave that column untouched.

Requirements:

- Accept a body containing `name`, `email`, or both — extract whichever
  keys are present with your Step 2 JSON helper and pass `None` for any
  key that's missing.
- Always return the complete, current row on success, not just the fields
  that were sent.
- Return `404` if no user with the given id exists (the `UPDATE ... WHERE
  id = $3` matches zero rows, so `query_opt` returns `None`).
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
