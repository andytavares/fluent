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

- Accept a body containing `name`, `email`, or both. Reuse the string
  extraction helper from Step 2 — if a key isn't present in the parsed
  body, don't include it in the `UPDATE`. Building the `SET` clause as a
  small `std::vector<std::string>` and joining it with commas works well:

  ```cpp
  std::vector<std::string> sets;
  std::vector<std::string> params;
  if (!name.empty())  { sets.push_back("name = $" + std::to_string(params.size()+1)); params.push_back(name); }
  if (!email.empty()) { sets.push_back("email = $" + std::to_string(params.size()+1)); params.push_back(email); }
  ```

- Always return the complete, current row on success, not just the fields
  that were sent — a `RETURNING *` clause on the `UPDATE` gets you this in
  one round trip.
- Return `404` if no user with the given id exists (check
  `PQntuples(result) == 0`).
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
