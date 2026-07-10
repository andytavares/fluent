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

Since either field (or both) may be present, use `COALESCE` in SQL so a
parameter that wasn't sent leaves the existing column value untouched.
`PQexecParams` treats a `NULL` pointer in the `paramValues` array as SQL
`NULL` — exactly what you want for an absent field:

```c
char name_buf[256], email_buf[256];
int has_name = extract_field(body, "name", name_buf, sizeof(name_buf)) == 0;
int has_email = extract_field(body, "email", email_buf, sizeof(email_buf)) == 0;

char id_str[32];
snprintf(id_str, sizeof(id_str), "%ld", id);

const char *params[3] = {
    has_name  ? name_buf  : NULL,
    has_email ? email_buf : NULL,
    id_str,
};

PGresult *res = PQexecParams(
    conn,
    "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) "
    "WHERE id = $3 "
    "RETURNING id, name, email, created_at::text",
    3, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res) == PGRES_TUPLES_OK && PQntuples(res) == 1) {
    // 200, build full row from PQgetvalue
} else {
    // 404, body {"error":"not found"}
}
PQclear(res);
```

Requirements:

- Accept a body containing `name`, `email`, or both — extract whichever
  keys are present with your Step 2 JSON helper and pass `NULL` for any
  key that's missing.
- Always return the complete, current row on success, not just the fields
  that were sent.
- Return `404` if no user with the given id exists (`UPDATE ... WHERE id =
  $3` matches zero rows, so `PQntuples` is `0`).
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
